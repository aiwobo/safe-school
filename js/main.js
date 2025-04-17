/**
 * 主应用程序入口
 * 负责初始化和管理应用程序各模块
 */

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 绑定导航菜单事件
    bindNavigationEvents();
});

/**
 * 绑定导航菜单事件
 */
function bindNavigationEvents() {
    // 地图监控导航
    document.getElementById('nav-map').addEventListener('click', function(e) {
        e.preventDefault();
        showPanel('map-panel');
        setActiveNav(this);
    });
    
    // 数据仪表盘导航
    document.getElementById('nav-dashboard').addEventListener('click', function(e) {
        e.preventDefault();
        showPanel('dashboard-panel');
        setActiveNav(this);
    });
    
    // 设备管理导航（仅管理员可见）
    document.getElementById('nav-devices').addEventListener('click', function(e) {
        e.preventDefault();
        showPanel('devices-panel');
        setActiveNav(this);
    });
}

/**
 * 设置激活的导航项
 * @param {HTMLElement} navItem - 导航项元素
 */
function setActiveNav(navItem) {
    // 移除所有导航项的激活状态
    document.querySelectorAll('.nav-link').forEach(item => {
        item.classList.remove('active');
    });
    
    // 设置当前导航项为激活状态
    navItem.classList.add('active');
}

/**
 * 显示指定的面板
 * @param {string} panelId - 面板元素ID
 */
function showPanel(panelId) {
    // 隐藏所有内容面板
    document.querySelectorAll('.content-panel').forEach(panel => {
        panel.style.display = 'none';
    });
    
    // 显示指定的面板
    document.getElementById(panelId).style.display = 'block';
}

/**
 * 初始化应用程序
 * 在用户登录成功后调用
 */
function initializeApp() {
    // 初始化地图模块
    initMap();
    
    // 初始化仪表盘模块
    initDashboard();
    
    // 初始化设备管理模块
    initDevicesManager();
    
    // 默认显示地图面板
    document.getElementById('nav-map').click();
} 