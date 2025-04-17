/**
 * 设备管理模块
 * 设备列表、筛选和操作功能
 */

/**
 * 初始化设备管理模块
 */
function initDevicesManager() {
    // 加载设备列表
    loadDeviceList();
    
    // 绑定筛选事件
    document.getElementById('device-type-filter').addEventListener('change', loadDeviceList);
    document.getElementById('device-status-filter').addEventListener('change', loadDeviceList);
}

/**
 * 加载设备列表
 */
function loadDeviceList() {
    // 获取筛选条件
    const typeFilter = document.getElementById('device-type-filter').value;
    const statusFilter = document.getElementById('device-status-filter').value;
    
    // 应用筛选
    let filteredDevices = devices.filter(device => {
        return (typeFilter === 'all' || device.type === typeFilter) &&
               (statusFilter === 'all' || device.status === statusFilter);
    });
    
    // 获取设备列表容器
    const deviceListContainer = document.getElementById('device-list');
    
    // 清空现有内容
    deviceListContainer.innerHTML = '';
    
    // 如果没有设备匹配筛选条件
    if (filteredDevices.length === 0) {
        deviceListContainer.innerHTML = '<tr><td colspan="6" class="text-center">没有符合条件的设备</td></tr>';
        return;
    }
    
    // 添加设备到列表
    filteredDevices.forEach(device => {
        // 格式化最后心跳时间
        const lastHeartbeatDate = new Date(device.lastHeartbeat);
        const timeAgo = getTimeAgo(lastHeartbeatDate);
        
        // 设置状态样式
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
        
        // 创建设备行元素
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${device.id}</td>
            <td>${getDeviceTypeName(device.type)}</td>
            <td>${device.location}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td>${timeAgo}</td>
            <td>
                <button class="btn btn-sm btn-primary btn-view" data-id="${device.id}">
                    <i class="fas fa-eye"></i> 查看
                </button>
                ${device.status === 'alert' ? `
                <button class="btn btn-sm btn-warning btn-mute" data-id="${device.id}">
                    <i class="fas fa-volume-mute"></i> 静音
                </button>
                ` : ''}
                <button class="btn btn-sm btn-secondary btn-restart" data-id="${device.id}">
                    <i class="fas fa-sync-alt"></i> 重启
                </button>
                ${device.type === 'sensor' ? `
                <button class="btn btn-sm btn-info btn-export" data-id="${device.id}">
                    <i class="fas fa-download"></i> 导出
                </button>
                ` : ''}
            </td>
        `;
        
        // 添加到容器
        deviceListContainer.appendChild(row);
        
        // 绑定查看按钮事件
        row.querySelector('.btn-view').addEventListener('click', () => {
            // 查找设备并显示详情
            const selectedDevice = devices.find(d => d.id === device.id);
            if (selectedDevice) {
                showDeviceDetails(selectedDevice);
            }
        });
        
        // 绑定静音按钮事件（如果存在）
        const muteBtn = row.querySelector('.btn-mute');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                if (checkPermission('mute_alarm')) {
                    muteDeviceAlarm(device.id);
                    loadDeviceList(); // 重新加载列表以更新状态
                } else {
                    alert('您没有权限执行此操作');
                }
            });
        }
        
        // 绑定重启按钮事件
        row.querySelector('.btn-restart').addEventListener('click', () => {
            restartDevice(device.id);
        });
        
        // 绑定导出按钮事件（如果存在）
        const exportBtn = row.querySelector('.btn-export');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                exportDeviceData(device.id);
            });
        }
    });
}

/**
 * 重启设备
 * @param {string} deviceId - 设备ID
 */
function restartDevice(deviceId) {
    // 检查权限
    if (!checkPermission('restart_device')) {
        alert('您没有权限执行此操作');
        return;
    }
    
    // 查找设备
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;
    
    // 确认重启
    if (!confirm(`确定要重启设备 ${device.name}（${device.id}）吗？`)) {
        return;
    }
    
    // 模拟重启过程
    // 在实际应用中，这里应该是一个API请求
    showNotification('操作中', `正在重启设备 ${device.name}...`, 'info');
    
    // 设备临时离线
    device.status = 'offline';
    device.alerts = [{
        type: 'system',
        time: new Date().toISOString(),
        message: '系统重启中'
    }];
    
    // 重新加载设备列表
    loadDeviceList();
    
    // 模拟重启完成
    setTimeout(() => {
        device.status = 'online';
        device.alerts = [];
        device.lastHeartbeat = new Date().toISOString();
        
        // 重新加载设备列表
        loadDeviceList();
        
        // 显示操作成功提示
        showNotification('成功', `设备 ${device.name} 已重启完成`, 'success');
        
        // 记录操作日志
        logUserAction('restart_device', { deviceId: deviceId });
    }, 5000);
}

/**
 * 导出设备历史数据
 * @param {string} deviceId - 设备ID
 */
function exportDeviceData(deviceId) {
    // 检查权限
    if (!checkPermission('export_data')) {
        alert('您没有权限执行此操作');
        return;
    }
    
    // 查找设备
    const device = devices.find(d => d.id === deviceId);
    if (!device || device.type !== 'sensor') return;
    
    // 模拟数据导出
    // 在实际应用中，这里应该是一个API请求获取历史数据
    showNotification('处理中', '正在准备导出数据...', 'info');
    
    // 生成模拟历史数据
    const now = new Date();
    const historyData = [];
    
    for (let i = 0; i < 24; i++) {
        const timestamp = new Date(now - i * 3600000); // 每小时一条数据
        historyData.push({
            timestamp: timestamp.toISOString(),
            temperature: getRandomTemperature(timestamp),
            humidity: getRandomHumidity(timestamp),
            pm25: 20 + Math.floor(Math.random() * 15),
            noise: 40 + Math.floor(Math.random() * 20)
        });
    }
    
    // 转换为CSV格式
    let csv = '时间戳,温度(°C),湿度(%),PM2.5(μg/m³),噪音(dB)\n';
    historyData.forEach(record => {
        csv += `${new Date(record.timestamp).toLocaleString()},${record.temperature},${record.humidity},${record.pm25},${record.noise}\n`;
    });
    
    // 创建Blob对象
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    
    // 创建下载链接
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${device.id}_history_data.csv`);
    link.style.visibility = 'hidden';
    
    // 添加到页面并触发点击
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    
    // 显示操作成功提示
    showNotification('完成', `设备 ${device.name} 的历史数据已导出`, 'success');
    
    // 记录操作日志
    logUserAction('export_data', { deviceId: deviceId });
} 