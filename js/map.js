/**
 * 地图监控模块
 * 使用Leaflet实现校园地图及设备监控
 */

// 地图实例
let map = null;

// 设备图层
let devicesLayer = null;

// 模拟设备数据
const devices = [
    {
        id: 'CAM001',
        type: 'camera',
        name: '主楼前摄像头',
        location: '主教学楼前',
        status: 'online',
        coords: [30.5425, 114.3657], // 这应该是校园内某处的经纬度
        battery: 90,
        lastHeartbeat: new Date().toISOString(),
        alerts: []
    },
    {
        id: 'CAM002',
        type: 'camera',
        name: '图书馆入口摄像头',
        location: '图书馆入口',
        status: 'online',
        coords: [30.5430, 114.3659],
        battery: 85,
        lastHeartbeat: new Date().toISOString(),
        alerts: []
    },
    {
        id: 'SENS001',
        type: 'sensor',
        name: '主楼环境传感器',
        location: '主楼一层大厅',
        status: 'online',
        coords: [30.5426, 114.3655],
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
        name: '图书馆环境传感器',
        location: '图书馆二层',
        status: 'offline',
        coords: [30.5431, 114.3658],
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
        name: '主楼大门门禁',
        location: '主楼正门',
        status: 'alert',
        coords: [30.5425, 114.3653],
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
        name: '实验室门禁',
        location: '实验楼二层',
        status: 'online',
        coords: [30.5423, 114.3662],
        battery: 88,
        lastHeartbeat: new Date().toISOString(),
        alerts: []
    }
];

/**
 * 初始化地图
 */
function initMap() {
    // 创建地图实例，设置中心点和缩放级别
    map = L.map('map-container').setView([30.5425, 114.3657], 17);
    
    // 加载OpenStreetMap瓦片图层
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // 创建设备图层组
    devicesLayer = L.layerGroup().addTo(map);
    
    // 加载设备标记
    loadDeviceMarkers();
    
    // 每30秒更新一次设备状态（模拟实时更新）
    setInterval(updateDeviceStatus, 30000);
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
    
    // 随机模拟状态变化（低概率）
    if (Math.random() < 0.2) {
        // 如果当前不是报警状态，有小概率变为报警
        if (device.status !== 'alert' && Math.random() < 0.3) {
            device.status = 'alert';
            
            // 根据设备类型生成不同的报警
            let alertType, alertMessage;
            
            switch(device.type) {
                case 'camera':
                    alertType = 'intrusion';
                    alertMessage = '检测到可疑人员';
                    break;
                case 'sensor':
                    if (Math.random() < 0.5) {
                        alertType = 'temperature';
                        alertMessage = '温度异常';
                    } else {
                        alertType = 'fire';
                        alertMessage = '可能发生火灾';
                    }
                    break;
                case 'door':
                    alertType = 'intrusion';
                    alertMessage = '非授权人员尝试进入';
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
            device.data = {
                temperature: 20 + 5 * Math.sin(Date.now() / 5000),
                humidity: 50 + 10 * Math.cos(Date.now() / 7000),
                pm25: 20 + Math.floor(Math.random() * 15),
                noise: 40 + Math.floor(Math.random() * 20)
            };
        }
    }
    
    // 更新地图标记
    loadDeviceMarkers();
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