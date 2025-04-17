-- 创建智慧校园安全生态平台数据库
CREATE DATABASE IF NOT EXISTS safe_school_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE safe_school_db;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'guard', 'visitor') NOT NULL,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 设备类型表
CREATE TABLE IF NOT EXISTS device_types (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_code VARCHAR(20) NOT NULL UNIQUE,
    type_name VARCHAR(50) NOT NULL,
    icon_class VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 建筑物表
CREATE TABLE IF NOT EXISTS buildings (
    building_id INT AUTO_INCREMENT PRIMARY KEY,
    building_name VARCHAR(100) NOT NULL,
    building_code VARCHAR(20) NOT NULL UNIQUE,
    building_type VARCHAR(50),
    location_x FLOAT NOT NULL,
    location_y FLOAT NOT NULL,
    floor_count INT DEFAULT 1,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 设备表
CREATE TABLE IF NOT EXISTS devices (
    device_id INT AUTO_INCREMENT PRIMARY KEY,
    device_code VARCHAR(20) NOT NULL UNIQUE,
    device_name VARCHAR(100) NOT NULL,
    type_id INT NOT NULL,
    building_id INT NOT NULL,
    location VARCHAR(100) NOT NULL,
    location_x FLOAT NOT NULL,
    location_y FLOAT NOT NULL,
    floor INT DEFAULT 1,
    status ENUM('online', 'offline', 'alert', 'maintenance') DEFAULT 'online',
    ip_address VARCHAR(50),
    mac_address VARCHAR(50),
    battery_level INT DEFAULT 100,
    last_heartbeat DATETIME,
    installed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES device_types(type_id),
    FOREIGN KEY (building_id) REFERENCES buildings(building_id)
) ENGINE=InnoDB;

-- 传感器数据表
CREATE TABLE IF NOT EXISTS sensor_data (
    data_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL,
    temperature FLOAT,
    humidity FLOAT,
    pm25 FLOAT,
    noise FLOAT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(device_id)
) ENGINE=InnoDB;

-- 报警类型表
CREATE TABLE IF NOT EXISTS alert_types (
    alert_type_id INT AUTO_INCREMENT PRIMARY KEY,
    alert_code VARCHAR(20) NOT NULL UNIQUE,
    alert_name VARCHAR(50) NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    color_code VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 报警记录表
CREATE TABLE IF NOT EXISTS alerts (
    alert_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL,
    alert_type_id INT NOT NULL,
    alert_message TEXT NOT NULL,
    status ENUM('active', 'acknowledged', 'resolved', 'false_alarm') DEFAULT 'active',
    resolved_at DATETIME,
    resolved_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(device_id),
    FOREIGN KEY (alert_type_id) REFERENCES alert_types(alert_type_id),
    FOREIGN KEY (resolved_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- 操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    operation_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50),
    target_id INT,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- 设备维护记录表
CREATE TABLE IF NOT EXISTS maintenance_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL,
    maintenance_type ENUM('routine', 'repair', 'battery_replace', 'upgrade') NOT NULL,
    performed_by INT NOT NULL,
    maintenance_date DATETIME NOT NULL,
    description TEXT,
    next_maintenance_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(device_id),
    FOREIGN KEY (performed_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- 门禁出入记录表
CREATE TABLE IF NOT EXISTS access_records (
    record_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL,
    card_id VARCHAR(50),
    person_name VARCHAR(100),
    access_type ENUM('entry', 'exit') NOT NULL,
    access_result ENUM('granted', 'denied') NOT NULL,
    reason_if_denied VARCHAR(100),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(device_id)
) ENGINE=InnoDB;

-- 系统设置表
CREATE TABLE IF NOT EXISTS system_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_group VARCHAR(50),
    description TEXT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- 插入初始数据

-- 插入用户数据
INSERT INTO users (email, username, password, role) VALUES
('admin@safe.edu', '管理员', '$2y$10$EXoxPEg.NQQnS3o4WpzKneVWgBXR0hE6JgSzVRrTYFqN1aQM0Wgtq', 'admin'), -- 密码: admin123
('guard@safe.edu', '安保人员', '$2y$10$G2DQEEYcgS.TUc6Ue.lqRekYM8Wj9Sz4tPV4OYcj15WMYwf27.qIW', 'guard'); -- 密码: guard456

-- 插入设备类型数据
INSERT INTO device_types (type_code, type_name, icon_class, description) VALUES
('camera', '摄像头', 'device-camera', '监控摄像头，用于视频监控'),
('sensor', '环境传感器', 'device-sensor', '用于监测温度、湿度、空气质量等环境参数'),
('door', '门禁控制器', 'device-door', '用于控制门禁系统的进出权限');

-- 插入建筑物数据
INSERT INTO buildings (building_name, building_code, building_type, location_x, location_y, floor_count, description) VALUES
('图书馆', 'LIB', '教学建筑', 0.5, 0.6, 3, '校园图书馆'),
('教学楼', 'TCH', '教学建筑', 0.7, 0.7, 5, '主教学楼'),
('实验楼', 'LAB', '教学建筑', 0.3, 0.7, 4, '实验教学楼'),
('行政楼', 'ADM', '行政建筑', 0.8, 0.7, 2, '行政办公楼'),
('田径场', 'SPF', '体育设施', 0.7, 0.3, 1, '田径运动场'),
('综合体育馆', 'GYM', '体育设施', 0.6, 0.4, 1, '综合体育馆'),
('创新创业实训基地', 'INN', '实训基地', 0.8, 0.5, 2, '创新创业实训基地'),
('1号学生公寓', 'D01', '宿舍楼', 0.2, 0.4, 6, '1号学生公寓'),
('2号学生公寓', 'D02', '宿舍楼', 0.3, 0.4, 6, '2号学生公寓'),
('3号学生公寓', 'D03', '宿舍楼', 0.1, 0.35, 6, '3号学生公寓'),
('4号学生公寓', 'D04', '宿舍楼', 0.1, 0.4, 6, '4号学生公寓'),
('5号学生公寓', 'D05', '宿舍楼', 0.1, 0.45, 6, '5号学生公寓'),
('6号学生公寓', 'D06', '宿舍楼', 0.4, 0.3, 6, '6号学生公寓'),
('7号学生公寓', 'D07', '宿舍楼', 0.4, 0.25, 6, '7号学生公寓'),
('8号学生公寓', 'D08', '宿舍楼', 0.45, 0.1, 6, '8号学生公寓'),
('9号学生公寓', 'D09', '宿舍楼', 0.45, 0.15, 6, '9号学生公寓'),
('10号学生公寓', 'D10', '宿舍楼', 0.25, 0.15, 6, '10号学生公寓'),
('11号学生公寓', 'D11', '宿舍楼', 0.25, 0.1, 6, '11号学生公寓'),
('12号学生公寓', 'D12', '宿舍楼', 0.25, 0.05, 6, '12号学生公寓'),
('13号学生公寓', 'D13', '宿舍楼', 0.25, 0.0, 6, '13号学生公寓'),
('14号学生公寓', 'D14', '宿舍楼', 0.75, 0.1, 6, '14号学生公寓'),
('15号学生公寓', 'D15', '宿舍楼', 0.75, 0.15, 6, '15号学生公寓'),
('16号学生公寓', 'D16', '宿舍楼', 0.75, 0.2, 6, '16号学生公寓');

-- 插入报警类型数据
INSERT INTO alert_types (alert_code, alert_name, severity, color_code, description) VALUES
('intrusion', '入侵报警', 'high', '#e74c3c', '检测到未授权人员入侵'),
('fire', '火灾报警', 'critical', '#ff9800', '可能发生火灾的报警'),
('offline', '设备离线', 'medium', '#95a5a6', '设备无法连接或电池电量耗尽'),
('temperature', '温度异常', 'medium', '#f39c12', '检测到异常温度'),
('humidity', '湿度异常', 'medium', '#3498db', '检测到异常湿度'),
('air', '空气质量异常', 'medium', '#27ae60', 'PM2.5或其他空气质量指标异常'),
('crowd', '人员密度过高', 'medium', '#8e44ad', '检测到区域内人员密度超过阈值'),
('motion', '异常活动', 'medium', '#2c3e50', '非常规时间检测到活动'),
('unauthorized_access', '非授权访问', 'high', '#c0392b', '非授权人员尝试访问受限区域'),
('forced_entry', '强制入侵', 'high', '#d35400', '检测到强制开门行为');

-- 插入设备数据
INSERT INTO devices (device_code, device_name, type_id, building_id, location, location_x, location_y, status, battery_level, last_heartbeat) VALUES
('CAM001', '图书馆入口摄像头', 1, 1, '图书馆一楼入口', 0.5, 0.62, 'online', 90, NOW()),
('CAM002', '教学楼走廊摄像头', 1, 2, '教学楼二楼走廊', 0.7, 0.68, 'online', 85, NOW()),
('CAM003', '田径场摄像头', 1, 5, '田径场南侧', 0.68, 0.32, 'online', 92, NOW()),
('SENS001', '1号公寓环境传感器', 2, 8, '1号学生公寓一楼大厅', 0.21, 0.41, 'online', 72, NOW()),
('SENS002', '13号公寓环境传感器', 2, 20, '13号学生公寓二楼走廊', 0.24, 0.01, 'offline', 15, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('SENS003', '图书馆环境传感器', 2, 1, '图书馆阅览室', 0.49, 0.59, 'online', 88, NOW()),
('DOOR001', '综合体育馆门禁', 3, 6, '综合体育馆主入口', 0.61, 0.42, 'alert', 60, NOW()),
('DOOR002', '图书馆门禁', 3, 1, '图书馆主入口', 0.5, 0.61, 'online', 88, NOW()),
('DOOR003', '创新创业基地门禁', 3, 7, '创新创业实训基地入口', 0.81, 0.51, 'online', 95, NOW());

-- 插入传感器数据
INSERT INTO sensor_data (device_id, temperature, humidity, pm25, noise, recorded_at) VALUES
(4, 24.5, 55.0, 28.0, 45.0, NOW()),
(4, 24.3, 56.0, 27.5, 43.0, DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
(4, 24.1, 56.5, 27.0, 42.0, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(6, 23.8, 54.0, 26.0, 38.0, NOW()),
(6, 23.7, 53.5, 26.5, 39.0, DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
(6, 23.5, 53.0, 27.0, 40.0, DATE_SUB(NOW(), INTERVAL 10 MINUTE));

-- 插入报警记录
INSERT INTO alerts (device_id, alert_type_id, alert_message, status, created_at) VALUES
(7, 9, '非授权人员尝试进入', 'active', NOW()),
(5, 3, '设备电量不足，已离线', 'active', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 插入系统设置
INSERT INTO system_settings (setting_key, setting_value, setting_group, description) VALUES
('alert_notification_timeout', '5000', 'notifications', '报警通知显示时间（毫秒）'),
('map_default_center_x', '0.5', 'map', '地图默认中心点X坐标'),
('map_default_center_y', '0.4', 'map', '地图默认中心点Y坐标'),
('map_default_zoom', '1', 'map', '地图默认缩放级别'),
('data_refresh_interval', '5000', 'dashboard', '数据刷新间隔（毫秒）'),
('alert_stats_refresh_interval', '30000', 'dashboard', '报警统计刷新间隔（毫秒）');

-- 创建视图
-- 设备状态概览视图
CREATE OR REPLACE VIEW device_status_overview AS
SELECT
    dt.type_name,
    COUNT(d.device_id) AS total_count,
    SUM(CASE WHEN d.status = 'online' THEN 1 ELSE 0 END) AS online_count,
    SUM(CASE WHEN d.status = 'offline' THEN 1 ELSE 0 END) AS offline_count,
    SUM(CASE WHEN d.status = 'alert' THEN 1 ELSE 0 END) AS alert_count,
    SUM(CASE WHEN d.status = 'maintenance' THEN 1 ELSE 0 END) AS maintenance_count,
    ROUND(SUM(CASE WHEN d.status = 'online' THEN 1 ELSE 0 END) / COUNT(d.device_id) * 100, 2) AS online_percentage
FROM
    devices d
JOIN
    device_types dt ON d.type_id = dt.type_id
GROUP BY
    dt.type_name;

-- 报警统计视图
CREATE OR REPLACE VIEW alert_statistics AS
SELECT
    at.alert_name,
    at.severity,
    COUNT(a.alert_id) AS alert_count,
    MAX(a.created_at) AS latest_alert_time
FROM
    alerts a
JOIN
    alert_types at ON a.alert_type_id = at.alert_type_id
WHERE
    a.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
GROUP BY
    at.alert_name, at.severity
ORDER BY
    at.severity DESC, alert_count DESC;

-- 建筑物设备统计视图
CREATE OR REPLACE VIEW building_device_stats AS
SELECT
    b.building_name,
    b.building_type,
    COUNT(d.device_id) AS total_devices,
    SUM(CASE WHEN dt.type_code = 'camera' THEN 1 ELSE 0 END) AS camera_count,
    SUM(CASE WHEN dt.type_code = 'sensor' THEN 1 ELSE 0 END) AS sensor_count,
    SUM(CASE WHEN dt.type_code = 'door' THEN 1 ELSE 0 END) AS door_count,
    SUM(CASE WHEN d.status = 'alert' THEN 1 ELSE 0 END) AS alert_count
FROM
    buildings b
LEFT JOIN
    devices d ON b.building_id = d.building_id
LEFT JOIN
    device_types dt ON d.type_id = dt.type_id
GROUP BY
    b.building_name, b.building_type
ORDER BY
    total_devices DESC;

-- 创建存储过程
-- 获取设备状态历史记录
DELIMITER $$
CREATE PROCEDURE GetDeviceStatusHistory(IN deviceId INT, IN days INT)
BEGIN
    -- 获取设备报警历史
    SELECT
        a.alert_id,
        at.alert_name,
        a.alert_message,
        a.status,
        a.created_at,
        a.resolved_at,
        CASE 
            WHEN a.resolved_at IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, a.created_at, a.resolved_at)
            ELSE NULL
        END AS resolution_time_minutes,
        u.username AS resolved_by_user
    FROM
        alerts a
    JOIN
        alert_types at ON a.alert_type_id = at.alert_type_id
    LEFT JOIN
        users u ON a.resolved_by = u.user_id
    WHERE
        a.device_id = deviceId
        AND a.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL days DAY)
    ORDER BY
        a.created_at DESC;
        
    -- 获取设备维护历史
    SELECT
        mr.record_id,
        mr.maintenance_type,
        u.username AS performed_by_user,
        mr.maintenance_date,
        mr.description,
        mr.next_maintenance_date
    FROM
        maintenance_records mr
    JOIN
        users u ON mr.performed_by = u.user_id
    WHERE
        mr.device_id = deviceId
        AND mr.maintenance_date >= DATE_SUB(CURRENT_DATE(), INTERVAL days DAY)
    ORDER BY
        mr.maintenance_date DESC;
        
    -- 获取传感器数据统计（如果是传感器）
    SELECT
        'sensor_stats' AS data_type,
        COUNT(*) AS total_readings,
        ROUND(AVG(temperature), 1) AS avg_temperature,
        ROUND(MIN(temperature), 1) AS min_temperature,
        ROUND(MAX(temperature), 1) AS max_temperature,
        ROUND(AVG(humidity), 1) AS avg_humidity,
        ROUND(MIN(humidity), 1) AS min_humidity,
        ROUND(MAX(humidity), 1) AS max_humidity,
        ROUND(AVG(pm25), 1) AS avg_pm25,
        ROUND(AVG(noise), 1) AS avg_noise
    FROM
        sensor_data
    WHERE
        device_id = deviceId
        AND recorded_at >= DATE_SUB(CURRENT_DATE(), INTERVAL days DAY);
END$$
DELIMITER ;

-- 创建触发器
-- 当设备报警时更新设备状态
DELIMITER $$
CREATE TRIGGER after_alert_insert
AFTER INSERT ON alerts
FOR EACH ROW
BEGIN
    -- 如果是新的活动报警，更新设备状态为报警状态
    IF NEW.status = 'active' THEN
        UPDATE devices SET status = 'alert', updated_at = NOW()
        WHERE device_id = NEW.device_id;
    END IF;
END$$
DELIMITER ;

-- 当报警解决时更新设备状态
DELIMITER $$
CREATE TRIGGER after_alert_update
AFTER UPDATE ON alerts
FOR EACH ROW
BEGIN
    -- 如果报警被解决，检查是否还有其他活动报警
    IF OLD.status = 'active' AND NEW.status IN ('resolved', 'acknowledged', 'false_alarm') THEN
        -- 检查设备是否还有其他活动报警
        IF NOT EXISTS (
            SELECT 1 FROM alerts 
            WHERE device_id = NEW.device_id AND status = 'active' AND alert_id <> NEW.alert_id
        ) THEN
            -- 如果没有其他活动报警，将设备状态恢复为在线
            UPDATE devices SET status = 'online', updated_at = NOW()
            WHERE device_id = NEW.device_id;
        END IF;
    END IF;
END$$
DELIMITER ;

-- 当设备电池电量降至20%以下时自动创建低电量警报
DELIMITER $$
CREATE TRIGGER before_device_update
BEFORE UPDATE ON devices
FOR EACH ROW
BEGIN
    -- 检查电池电量是否从>20%降至<=20%
    IF OLD.battery_level > 20 AND NEW.battery_level <= 20 THEN
        -- 插入低电量警报
        INSERT INTO alerts (device_id, alert_type_id, alert_message, status)
        VALUES (NEW.device_id, 
                (SELECT alert_type_id FROM alert_types WHERE alert_code = 'offline' LIMIT 1),
                CONCAT('设备电量低: ', NEW.battery_level, '%'),
                'active');
    END IF;
    
    -- 检查设备是否离线
    IF OLD.status != 'offline' AND NEW.status = 'offline' THEN
        -- 插入设备离线警报
        INSERT INTO alerts (device_id, alert_type_id, alert_message, status)
        VALUES (NEW.device_id, 
                (SELECT alert_type_id FROM alert_types WHERE alert_code = 'offline' LIMIT 1),
                '设备已离线',
                'active');
    END IF;
END$$
DELIMITER ; 