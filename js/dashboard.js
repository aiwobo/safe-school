/**
 * 数据仪表盘模块
 * 使用ECharts实现环境数据可视化和报警统计
 */

// 环境数据图表实例
let envChart = null;

// 报警统计图表实例
let alertChart = null;

// 存储历史环境数据
const envHistoryData = {
    timestamps: [],
    temperature: [],
    humidity: []
};

// 模拟报警统计数据
let alertStats = {
    intrusion: 3,      // 入侵报警
    fire: 1,           // 火灾报警
    offline: 2,        // 设备离线
    temperature: 2,    // 温度异常
    humidity: 1,       // 湿度异常
    air: 1,            // 空气质量异常
    crowd: 2,          // 人员密度过高
    motion: 1,         // 夜间异常活动
    unauthorized_access: 1, // 非授权访问
    forced_entry: 1    // 强制开门
};

/**
 * 初始化仪表盘
 */
function initDashboard() {
    // 初始化环境数据图表
    initEnvChart();
    
    // 初始化报警统计图表
    initAlertChart();
    
    // 定时更新数据
    setInterval(updateEnvData, 5000);
    setInterval(updateAlertStats, 30000);
}

/**
 * 初始化环境数据图表
 */
function initEnvChart() {
    // 获取图表容器
    const chartDom = document.getElementById('env-chart');
    envChart = echarts.init(chartDom);
    
    // 生成初始数据
    const now = new Date();
    for (let i = 0; i < 20; i++) {
        const time = new Date(now - (20 - i) * 5000);
        envHistoryData.timestamps.push(time.toLocaleTimeString('zh-CN', {hour12: false}));
        envHistoryData.temperature.push(getRandomTemperature(time));
        envHistoryData.humidity.push(getRandomHumidity(time));
    }
    
    // 设置图表选项
    const option = {
        title: {
            text: '校园环境实时监测',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985'
                }
            }
        },
        legend: {
            data: ['温度', '湿度'],
            top: 30
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: envHistoryData.timestamps
        },
        yAxis: [
            {
                type: 'value',
                name: '温度 (°C)',
                position: 'left',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#ee6666'
                    }
                },
                axisLabel: {
                    formatter: '{value} °C'
                }
            },
            {
                type: 'value',
                name: '湿度 (%)',
                position: 'right',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#5470c6'
                    }
                },
                axisLabel: {
                    formatter: '{value} %'
                }
            }
        ],
        series: [
            {
                name: '温度',
                type: 'line',
                yAxisIndex: 0,
                smooth: true,
                lineStyle: {
                    width: 3,
                    color: '#ee6666'
                },
                areaStyle: {
                    opacity: 0.2,
                    color: '#ee6666'
                },
                data: envHistoryData.temperature
            },
            {
                name: '湿度',
                type: 'line',
                yAxisIndex: 1,
                smooth: true,
                lineStyle: {
                    width: 3,
                    color: '#5470c6'
                },
                areaStyle: {
                    opacity: 0.2,
                    color: '#5470c6'
                },
                data: envHistoryData.humidity
            }
        ]
    };
    
    // 设置并渲染图表
    envChart.setOption(option);
    
    // 响应窗口大小变化
    window.addEventListener('resize', function() {
        envChart.resize();
    });
}

/**
 * 初始化报警统计图表
 */
function initAlertChart() {
    // 获取图表容器
    const chartDom = document.getElementById('alert-chart');
    alertChart = echarts.init(chartDom);
    
    // 设置图表选项
    const option = {
        title: {
            text: '今日报警事件',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 10,
            top: 'center',
            data: ['入侵报警', '火灾报警', '设备离线', '温度异常', '湿度异常', '空气质量异常', '人员密度过高', '异常活动', '非授权访问']
        },
        series: [
            {
                name: '报警类型',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 20,
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                    { value: alertStats.intrusion, name: '入侵报警', itemStyle: { color: '#e74c3c' } },
                    { value: alertStats.fire, name: '火灾报警', itemStyle: { color: '#ff9800' } },
                    { value: alertStats.offline, name: '设备离线', itemStyle: { color: '#95a5a6' } },
                    { value: alertStats.temperature, name: '温度异常', itemStyle: { color: '#f39c12' } },
                    { value: alertStats.humidity, name: '湿度异常', itemStyle: { color: '#3498db' } },
                    { value: alertStats.air, name: '空气质量异常', itemStyle: { color: '#27ae60' } },
                    { value: alertStats.crowd, name: '人员密度过高', itemStyle: { color: '#8e44ad' } },
                    { value: alertStats.motion + alertStats.unauthorized_access, name: '异常活动', itemStyle: { color: '#2c3e50' } },
                    { value: alertStats.forced_entry, name: '非授权访问', itemStyle: { color: '#c0392b' } }
                ]
            }
        ]
    };
    
    // 设置并渲染图表
    alertChart.setOption(option);
    
    // 响应窗口大小变化
    window.addEventListener('resize', function() {
        alertChart.resize();
    });
}

/**
 * 更新环境数据
 */
function updateEnvData() {
    // 获取当前时间
    const now = new Date();
    const time = now.toLocaleTimeString('zh-CN', {hour12: false});
    
    // 生成新的数据点
    const newTemp = getRandomTemperature(now);
    const newHumidity = getRandomHumidity(now);
    
    // 添加新数据点
    envHistoryData.timestamps.push(time);
    envHistoryData.temperature.push(newTemp);
    envHistoryData.humidity.push(newHumidity);
    
    // 限制数据点数量（保留最近100个点）
    if (envHistoryData.timestamps.length > 100) {
        envHistoryData.timestamps.shift();
        envHistoryData.temperature.shift();
        envHistoryData.humidity.shift();
    }
    
    // 更新图表
    if (envChart) {
        envChart.setOption({
            xAxis: {
                data: envHistoryData.timestamps
            },
            series: [
                {
                    data: envHistoryData.temperature
                },
                {
                    data: envHistoryData.humidity
                }
            ]
        });
    }
}

/**
 * 更新报警统计数据
 */
function updateAlertStats() {
    // 模拟从API获取报警统计数据
    // 在真实应用中，这里应该是一个Ajax请求
    fetchAlertStats().then(data => {
        alertStats = data;
        
        // 更新图表
        if (alertChart) {
            alertChart.setOption({
                series: [
                    {
                        data: [
                            { value: alertStats.intrusion, name: '入侵报警', itemStyle: { color: '#e74c3c' } },
                            { value: alertStats.fire, name: '火灾报警', itemStyle: { color: '#ff9800' } },
                            { value: alertStats.offline, name: '设备离线', itemStyle: { color: '#95a5a6' } },
                            { value: alertStats.temperature, name: '温度异常', itemStyle: { color: '#f39c12' } },
                            { value: alertStats.humidity, name: '湿度异常', itemStyle: { color: '#3498db' } },
                            { value: alertStats.air, name: '空气质量异常', itemStyle: { color: '#27ae60' } },
                            { value: alertStats.crowd, name: '人员密度过高', itemStyle: { color: '#8e44ad' } },
                            { value: alertStats.motion + alertStats.unauthorized_access, name: '异常活动', itemStyle: { color: '#2c3e50' } },
                            { value: alertStats.forced_entry, name: '非授权访问', itemStyle: { color: '#c0392b' } }
                        ]
                    }
                ]
            });
        }
    });
}

/**
 * 模拟从API获取报警统计数据
 * @returns {Promise} - 包含报警统计数据的Promise
 */
function fetchAlertStats() {
    return new Promise((resolve) => {
        // 模拟API延迟
        setTimeout(() => {
            // 模拟服务器返回的数据
            const data = {
                intrusion: Math.floor(Math.random() * 5) + 1,
                fire: Math.floor(Math.random() * 2),
                offline: Math.floor(Math.random() * 4) + 1,
                temperature: Math.floor(Math.random() * 3),
                humidity: Math.floor(Math.random() * 2),
                air: Math.floor(Math.random() * 2),
                crowd: Math.floor(Math.random() * 3),
                motion: Math.floor(Math.random() * 2),
                unauthorized_access: Math.floor(Math.random() * 2),
                forced_entry: Math.floor(Math.random() * 2)
            };
            
            resolve(data);
        }, 300);
    });
}

/**
 * 获取随机温度数据
 * @param {Date} time - 时间点
 * @returns {number} - 模拟的温度数据
 */
function getRandomTemperature(time) {
    // 使用正弦函数模拟温度变化
    return parseFloat((20 + 5 * Math.sin(time.getTime() / 5000)).toFixed(1));
}

/**
 * 获取随机湿度数据
 * @param {Date} time - 时间点
 * @returns {number} - 模拟的湿度数据
 */
function getRandomHumidity(time) {
    // 使用余弦函数模拟湿度变化
    return parseFloat((50 + 10 * Math.cos(time.getTime() / 7000)).toFixed(1));
} 