/**
 * 用户认证模块
 * 负责用户登录、权限管理和会话控制
 */

// 用户数据（模拟数据库）
const users = {
    'admin@safe.edu': {
        password: 'admin123',
        username: '管理员',
        role: 'admin'
    },
    'guard@safe.edu': {
        password: 'guard456',
        username: '安保人员',
        role: 'guard'
    }
};

// 当前登录用户
let currentUser = null;

// 登录表单处理
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // 检查用户凭据
    if (users[email] && users[email].password === password) {
        // 登录成功
        loginUser(users[email], email);
    } else {
        // 登录失败
        alert('邮箱或密码错误，请重试');
    }
});

// 登出处理
document.getElementById('btn-logout').addEventListener('click', function() {
    logoutUser();
});

/**
 * 用户登录函数
 * @param {Object} user - 用户对象
 * @param {string} email - 用户邮箱
 */
function loginUser(user, email) {
    currentUser = {
        email: email,
        username: user.username,
        role: user.role
    };
    
    // 更新UI显示用户名
    document.getElementById('username').textContent = user.username;
    
    // 显示对应权限的菜单
    if (user.role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
    } else {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
    
    // 显示主内容，隐藏登录面板
    document.getElementById('login-panel').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    
    // 记录操作日志（实际应用中应该发送到服务器）
    console.log(`用户 ${user.username} (${user.role}) 登录成功 - ${new Date().toLocaleString()}`);
    
    // 触发初始化
    initializeApp();
}

/**
 * 用户登出函数
 */
function logoutUser() {
    // 记录操作日志
    if (currentUser) {
        console.log(`用户 ${currentUser.username} 登出 - ${new Date().toLocaleString()}`);
    }
    
    // 重置当前用户
    currentUser = null;
    
    // 隐藏主内容，显示登录面板
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('login-panel').style.display = 'block';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('username').textContent = '未登录';
}

/**
 * 检查用户是否有权限执行操作
 * @param {string} operation - 操作名称
 * @returns {boolean} - 是否有权限
 */
function checkPermission(operation) {
    if (!currentUser) return false;
    
    switch(operation) {
        case 'view_map':
        case 'view_dashboard':
            // 所有登录用户都可以查看地图和仪表盘
            return true;
        case 'manage_devices':
        case 'mute_alarm':
        case 'restart_device':
        case 'export_data':
            // 仅管理员可以管理设备
            return currentUser.role === 'admin';
        default:
            return false;
    }
}

/**
 * 记录用户操作（审计日志）
 * @param {string} operation - 操作描述
 * @param {Object} details - 操作详情
 */
function logUserAction(operation, details = {}) {
    if (!currentUser) return;
    
    const logEntry = {
        timestamp: new Date().toISOString(),
        user: currentUser.username,
        role: currentUser.role,
        operation: operation,
        details: details
    };
    
    // 在实际应用中，这里应该发送到服务器
    console.log('用户操作日志:', logEntry);
} 