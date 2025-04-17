/**
 * 地图监控模块
 * 使用Leaflet实现校园地图及设备监控
 */

// 地图实例
let map = null;

// 设备图层
let devicesLayer = null;

// 模拟设备数据，根据提供的校园地图布局
const devices = [
    {
        id: 'CAM001',
        type: 'camera',
        name: '图书馆摄像头',
        location: '图书馆',
        status: 'online',
        coords: [51.505, -0.09], // 临时坐标，将在地图初始化时调整
        battery: 90,
        lastHeartbeat: new Date().toISOString(),
        alerts: []
    },
    {
        id: 'CAM002',
        type: 'camera',
        name: '教学楼摄像头',
        location: '教学楼',
        status: 'online',
        coords: [51.505, -0.09], // 临时坐标，将在地图初始化时调整
        battery: 85,
        lastHeartbeat: new Date().toISOString(),
        alerts: []
    },
    {
        id: 'SENS001',
        type: 'sensor',
        name: '1号学生公寓环境传感器',
        location: '1号学生公寓',
        status: 'online',
        coords: [51.505, -0.09], // 临时坐标，将在地图初始化时调整
        battery: 72,
        lastHeartbeat: new Date().toISOString(),
        alerts: [],
        data: {
            temperature: 24.5,
            humidity: 55,
            pm25: 28,
            noise: 45
        }
    },
    {
        id: 'SENS002',
        type: 'sensor',
        name: '13号学生公寓环境传感器',
        location: '13号学生公寓',
        status: 'offline',
        coords: [51.505, -0.09], // 临时坐标，将在地图初始化时调整
        battery: 15,
        lastHeartbeat: new Date(Date.now() - 86400000).toISOString(), // 1天前
        alerts: [{
            type: 'offline',
            time: new Date(Date.now() - 86400000).toISOString(),
            message: '设备离线'
        }],
        data: {
            temperature: null,
            humidity: null,
            pm25: null,
            noise: null
        }
    },
    {
        id: 'DOOR001',
        type: 'door',
        name: '综合楼门禁',
        location: '综合楼',
        status: 'alert',
        coords: [51.505, -0.09], // 临时坐标，将在地图初始化时调整
        battery: 60,
        lastHeartbeat: new Date().toISOString(),
        alerts: [{
            type: 'intrusion',
            time: new Date().toISOString(),
            message: '非授权人员尝试进入'
        }]
    },
    {
        id: 'DOOR002',
        type: 'door',
        name: '田径场门禁',
        location: '田径场',
        status: 'online',
        coords: [51.505, -0.09], // 临时坐标，将在地图初始化时调整
        battery: 88,
        lastHeartbeat: new Date().toISOString(),
        alerts: []
    }
];

// 校园楼宇坐标映射表（相对坐标，将根据图片尺寸进行转换）
const buildingCoords = {
    '图书馆': [0.5, 0.6],  // x, y (相对于图片的比例位置)
    '教学楼': [0.7, 0.7],
    '实验楼': [0.3, 0.7],
    '行政楼': [0.8, 0.7],
    '田径场': [0.7, 0.3],
    '综合体育馆': [0.6, 0.4],
    '创新创业实训基地': [0.8, 0.5],
    '1号学生公寓': [0.2, 0.4],
    '2号学生公寓': [0.3, 0.4],
    '3号学生公寓': [0.1, 0.35],
    '4号学生公寓': [0.1, 0.4],
    '5号学生公寓': [0.1, 0.45],
    '6号学生公寓': [0.4, 0.3],
    '7号学生公寓': [0.4, 0.25],
    '8号学生公寓': [0.45, 0.1],
    '9号学生公寓': [0.45, 0.15],
    '10号学生公寓': [0.25, 0.15],
    '11号学生公寓': [0.25, 0.1],
    '12号学生公寓': [0.25, 0.05],
    '13号学生公寓': [0.25, 0],
    '14号学生公寓': [0.75, 0.1],
    '15号学生公寓': [0.75, 0.15],
    '16号学生公寓': [0.75, 0.2]
};

/**
 * 初始化地图
 */
function initMap() {
    // 创建一个简单的坐标系统，使用像素坐标而不是地理坐标
    // 创建地图实例，禁用默认的缩放控制，使用简单的CRS
    map = L.map('map-container', {
        crs: L.CRS.Simple,  // 使用简单的坐标系统
        zoomControl: false, // 禁用默认缩放控制
        attributionControl: false, // 禁用归属信息
        minZoom: -2,        // 允许更多缩小
        maxZoom: 2         // 限制最大缩放级别
    });
    
    // 添加自定义缩放控制到右上角
    L.control.zoom({
        position: 'topright'
    }).addTo(map);
    
    // 获取地图容器的尺寸
    const mapContainer = document.getElementById('map-container');
    const containerWidth = mapContainer.clientWidth;
    const containerHeight = mapContainer.clientHeight;
    
    // 假设图片宽高比为 4:3（这个值需要根据实际图片调整）
    const imageWidth = 1000;
    const imageHeight = 750;
    
    // 计算图片边界坐标
    const bounds = [[0, 0], [imageHeight, imageWidth]];
    
    // 添加校园地图图片作为图层
    const imageUrl = 'images/campus-map.jpg'; // 校园地图图片路径
    const imageOverlay = L.imageOverlay(imageUrl, bounds).addTo(map);
    
    // 将视图设置为图片的中心
    map.fitBounds(bounds);
    
    // 创建设备图层组
    devicesLayer = L.layerGroup().addTo(map);
    
    // 转换建筑物坐标并更新设备坐标
    updateDeviceCoordinates(imageWidth, imageHeight);
    
    // 加载设备标记
    loadDeviceMarkers();
    
    // 每30秒更新一次设备状态（模拟实时更新）
    setInterval(updateDeviceStatus, 30000);
}

/**
 * 更新设备坐标，将相对坐标转换为图片上的实际坐标
 * @param {number} width - 图片宽度
 * @param {number} height - 图片高度
 */
function updateDeviceCoordinates(width, height) {
    // 为每个设备分配对应建筑物的坐标
    devices.forEach(device => {
        const locationKey = getLocationKey(device.location);
        if (buildingCoords[locationKey]) {
            const [xRatio, yRatio] = buildingCoords[locationKey];
            // 转换为图片上的坐标（Leaflet中y轴是从下到上的）
            device.coords = [height * (1 - yRatio), width * xRatio];
            
            // 添加一点随机偏移，使同一建筑内的设备不重叠
            device.coords[0] += (Math.random() - 0.5) * 20;
            device.coords[1] += (Math.random() - 0.5) * 20;
        }
    });
}

/**
 * 根据设备位置描述获取对应的建筑物键名
 * @param {string} location - 设备位置描述
 * @returns {string} - 对应的建筑物键名
 */
function getLocationKey(location) {
    // 处理位置描述与建筑物映射表的匹配
    for (const key in buildingCoords) {
        if (location.includes(key)) {
            return key;
        }
    }
    
    // 如果没有精确匹配，尝试模糊匹配
    if (location.includes('公寓')) {
        return '1号学生公寓'; // 默认返回1号公寓
    } else if (location.includes('教学')) {
        return '教学楼';
    } else if (location.includes('实验')) {
        return '实验楼';
    } else if (location.includes('图书馆')) {
        return '图书馆';
    } else if (location.includes('田径')) {
        return '田径场';
    } else if (location.includes('行政')) {
        return '行政楼';
    } else if (location.includes('创新') || location.includes('创业')) {
        return '创新创业实训基地';
    }
    
    // 默认返回图书馆位置
    return '图书馆';
}

/**
 * 加载设备标记到地图
 */
function loadDeviceMarkers() {
    // 清空现有图层
    devicesLayer.clearLayers();
    
    // 遍历设备数据，添加标记
    devices.forEach(device => {
        // 根据设备类型设置图标
        let iconClass = '';
        let iconContent = '';
        
        switch(device.type) {
            case 'camera':
                iconClass = 'device-camera';
                iconContent = '<i class="fas fa-video"></i>';
                break;
            case 'sensor':
                iconClass = 'device-sensor';
                iconContent = '<i class="fas fa-tint"></i>';
                break;
            case 'door':
                iconClass = 'device-door';
                iconContent = '<i class="fas fa-door-closed"></i>';
                break;
        }
        
        // 如果设备处于报警状态，添加报警类
        if (device.status === 'alert') {
            iconClass += ' device-alert';
        }
        
        // 创建自定义图标
        const icon = L.divIcon({
            className: `device-icon ${iconClass}`,
            html: iconContent,
            iconSize: [36, 36]
        });
        
        // 创建标记并添加到图层
        const marker = L.marker(device.coords, {icon: icon})
            .bindTooltip(device.name)
            .on('click', () => showDeviceDetails(device));
        
        devicesLayer.addLayer(marker);
    });
}

/**
 * 更新设备状态（模拟实时数据）
 */
function updateDeviceStatus() {
    // 随机选择一个设备
    const randomIndex = Math.floor(Math.random() * devices.length);
    const device = devices[randomIndex];
    
    // 模拟电池电量变化
    device.battery = Math.max(1, device.battery - Math.floor(Math.random() * 3));
    
    // 更新最后心跳时间
    device.lastHeartbeat = new Date().toISOString();
    
    // 根据不同场景模拟事件
    const currentHour = new Date().getHours();
    let eventProbability = 0.1; // 基础事件概率
    
    // 早晚高峰时段（7-9点和17-19点）提高事件概率
    if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19)) {
        eventProbability = 0.3;
    }
    
    // 深夜时段（23-6点）在学生公寓提高事件概率
    if (currentHour >= 23 || currentHour <= 6) {
        if (device.location.includes('公寓')) {
            eventProbability = 0.25;
        } else {
            eventProbability = 0.05; // 其他区域降低事件概率
        }
    }
    
    // 随机模拟状态变化
    if (Math.random() < eventProbability) {
        // 如果当前不是报警状态，有概率变为报警
        if (device.status !== 'alert' && Math.random() < 0.4) {
            device.status = 'alert';
            
            // 根据设备类型和位置生成不同的报警
            let alertType, alertMessage;
            
            switch(device.type) {
                case 'camera':
                    // 摄像头报警类型
                    if (device.location.includes('公寓')) {
                        // 学生公寓摄像头
                        if (currentHour >= 23 || currentHour <= 6) {
                            alertType = 'motion';
                            alertMessage = '检测到异常活动';
                        } else {
                            alertType = 'crowd';
                            alertMessage = '人员密度过高';
                        }
                    } else if (device.location.includes('田径场')) {
                        // 田径场摄像头
                        alertType = 'intrusion';
                        alertMessage = '非开放时间有人进入';
                    } else {
                        // 其他区域摄像头
                        alertType = 'intrusion';
                        alertMessage = '检测到可疑人员';
                    }
                    break;
                    
                case 'sensor':
                    // 环境传感器报警
                    const randomSensorEvent = Math.random();
                    if (randomSensorEvent < 0.3) {
                        alertType = 'temperature';
                        alertMessage = '温度异常';
                    } else if (randomSensorEvent < 0.6) {
                        alertType = 'humidity';
                        alertMessage = '湿度异常';
                    } else if (randomSensorEvent < 0.9) {
                        alertType = 'air';
                        alertMessage = 'PM2.5浓度超标';
                    } else {
                        alertType = 'fire';
                        alertMessage = '可能发生火灾';
                    }
                    break;
                    
                case 'door':
                    // 门禁控制器报警
                    if (device.location.includes('图书馆') || device.location.includes('创新创业')) {
                        // 图书馆或创新创业基地
                        if (currentHour >= 22 || currentHour <= 7) {
                            alertType = 'unauthorized_access';
                            alertMessage = '非开放时间有人进入';
                        } else {
                            alertType = 'forced_entry';
                            alertMessage = '检测到强制开门';
                        }
                    } else {
                        // 其他门禁
                        alertType = 'intrusion';
                        alertMessage = '非授权人员尝试进入';
                    }
                    break;
            }
            
            // 添加报警信息
            device.alerts.push({
                type: alertType,
                time: new Date().toISOString(),
                message: alertMessage
            });
            
            // 显示报警通知
            showNotification('报警', `${device.name}: ${alertMessage}`, 'danger');
        }
        
        // 如果是环境传感器，更新环境数据
        if (device.type === 'sensor' && device.status !== 'offline') {
            // 根据时间及季节模拟真实数据
            const now = Date.now();
            const isDaytime = currentHour >= 7 && currentHour <= 19;
            
            // 温度波动规律
            const baseTemp = isDaytime ? 23 : 20;
            const tempAmplitude = isDaytime ? 5 : 2;
            
            // 湿度波动规律
            const baseHumidity = 50;
            const humidityAmplitude = 15;
            
            // 模拟一天内的数据波动
            const dayProgress = (currentHour / 24) * 2 * Math.PI;
            
            device.data = {
                // 温度白天较高，夜间较低
                temperature: parseFloat((baseTemp + tempAmplitude * Math.sin(dayProgress + now/10000)).toFixed(1)),
                // 湿度早晚较高，中午较低
                humidity: parseFloat((baseHumidity + humidityAmplitude * Math.cos(dayProgress + now/12000)).toFixed(1)),
                // PM2.5随机波动
                pm25: Math.floor(15 + Math.random() * 20),
                // 噪音白天较高，夜间较低
                noise: isDaytime ? Math.floor(50 + Math.random() * 15) : Math.floor(30 + Math.random() * 10)
            };
        }
    }
    
    // 更新地图标记
    loadDeviceMarkers();
}

/**
 * 显示设备详情模态框
 * @param {Object} device - 设备对象
 */
function showDeviceDetails(device) {
    // 设置模态框标题
    document.getElementById('deviceModalTitle').textContent = device.name;
    
    // 格式化上次心跳时间
    const lastHeartbeatDate = new Date(device.lastHeartbeat);
    const timeAgo = getTimeAgo(lastHeartbeatDate);
    
    // 获取电池图标
    const batteryIcon = getBatteryIcon(device.battery);
    
    // 设置模态框内容
    let statusClass = '';
    let statusText = '';
    
    switch(device.status) {
        case 'online':
            statusClass = 'status-online';
            statusText = '在线';
            break;
        case 'offline':
            statusClass = 'status-offline';
            statusText = '离线';
            break;
        case 'alert':
            statusClass = 'status-alert';
            statusText = '报警中';
            break;
    }
    
    // 构建详情HTML
    let detailsHtml = `
        <div class="device-detail">
            <strong>设备ID:</strong> ${device.id}
        </div>
        <div class="device-detail">
            <strong>类型:</strong> ${getDeviceTypeName(device.type)}
        </div>
        <div class="device-detail">
            <strong>位置:</strong> ${device.location}
        </div>
        <div class="device-detail">
            <strong>状态:</strong> <span class="${statusClass}">${statusText}</span>
        </div>
        <div class="device-detail">
            <strong>电量:</strong> ${batteryIcon} ${device.battery}%
        </div>
        <div class="device-detail">
            <strong>最后心跳:</strong> ${timeAgo} (${lastHeartbeatDate.toLocaleString()})
        </div>
    `;
    
    // 如果有报警信息，添加到详情中
    if (device.alerts && device.alerts.length > 0) {
        detailsHtml += '<div class="device-detail"><strong>报警信息:</strong><ul>';
        device.alerts.forEach(alert => {
            const alertTime = new Date(alert.time).toLocaleString();
            detailsHtml += `<li>${alert.message} (${alertTime})</li>`;
        });
        detailsHtml += '</ul></div>';
    }
    
    // 如果是环境传感器，显示环境数据
    if (device.type === 'sensor' && device.data) {
        detailsHtml += '<div class="device-detail"><strong>环境数据:</strong>';
        if (device.status === 'online') {
            detailsHtml += `
                <ul>
                    <li>温度: ${device.data.temperature}°C</li>
                    <li>湿度: ${device.data.humidity}%</li>
                    <li>PM2.5: ${device.data.pm25} μg/m³</li>
                    <li>噪音: ${device.data.noise} dB</li>
                </ul>
            `;
        } else {
            detailsHtml += '<p>设备离线，无法获取数据</p>';
        }
        detailsHtml += '</div>';
    }
    
    // 更新模态框内容
    document.getElementById('deviceModalBody').innerHTML = detailsHtml;
    
    // 处理静音报警按钮状态
    const muteBtn = document.getElementById('muteAlarm');
    if (device.status === 'alert' && checkPermission('mute_alarm')) {
        muteBtn.style.display = 'block';
        muteBtn.onclick = () => muteDeviceAlarm(device.id);
    } else {
        muteBtn.style.display = 'none';
    }
    
    // 显示模态框
    const deviceModal = new bootstrap.Modal(document.getElementById('deviceModal'));
    deviceModal.show();
    
    // 记录用户查看设备详情的操作
    logUserAction('view_device_detail', { deviceId: device.id });
}

/**
 * 静音设备报警
 * @param {string} deviceId - 设备ID
 */
function muteDeviceAlarm(deviceId) {
    // 检查权限
    if (!checkPermission('mute_alarm')) {
        alert('您没有权限执行此操作');
        return;
    }
    
    // 查找设备
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;
    
    // 修改设备状态
    device.status = 'online';
    device.alerts = [];
    
    // 关闭模态框
    const deviceModal = bootstrap.Modal.getInstance(document.getElementById('deviceModal'));
    deviceModal.hide();
    
    // 更新地图标记
    loadDeviceMarkers();
    
    // 显示操作成功提示
    showNotification('成功', `已静音设备 ${device.name} 的报警`, 'success');
    
    // 记录操作日志
    logUserAction('mute_alarm', { deviceId: deviceId });
}

/**
 * 显示通知
 * @param {string} title - 通知标题
 * @param {string} message - 通知内容
 * @param {string} type - 通知类型 (success, info, warning, danger)
 */
function showNotification(title, message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show alert-notification`;
    notification.innerHTML = `
        <strong>${title}</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 自动关闭（5秒后）
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }
    }, 5000);
}

/**
 * 获取电池图标
 * @param {number} batteryLevel - 电池电量百分比
 * @returns {string} - 电池图标HTML
 */
function getBatteryIcon(batteryLevel) {
    let iconClass = 'fa-battery-empty';
    let iconColor = 'text-danger';
    
    if (batteryLevel > 80) {
        iconClass = 'fa-battery-full';
        iconColor = 'text-success';
    } else if (batteryLevel > 60) {
        iconClass = 'fa-battery-three-quarters';
        iconColor = 'text-success';
    } else if (batteryLevel > 40) {
        iconClass = 'fa-battery-half';
        iconColor = 'text-warning';
    } else if (batteryLevel > 20) {
        iconClass = 'fa-battery-quarter';
        iconColor = 'text-warning';
    }
    
    return `<i class="fas ${iconClass} ${iconColor}"></i>`;
}

/**
 * 获取设备类型名称
 * @param {string} type - 设备类型
 * @returns {string} - 设备类型中文名称
 */
function getDeviceTypeName(type) {
    switch(type) {
        case 'camera': return '摄像头';
        case 'sensor': return '环境传感器';
        case 'door': return '门禁控制器';
        default: return '未知设备';
    }
}

/**
 * 获取时间间隔的友好显示
 * @param {Date} date - 日期对象
 * @returns {string} - 友好显示的时间间隔
 */
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return '刚刚';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}分钟前`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    
    const days = Math.floor(hours / 24);
    return `${days}天前`;
} 