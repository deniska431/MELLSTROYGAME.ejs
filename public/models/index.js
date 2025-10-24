const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite:./database.sqlite');
// Определение моделей
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    login: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const Service = sequelize.define('Service', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: { type: DataTypes.STRING, allowNull: false }
});

const Request = sequelize.define('Request', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    serviceId: { type: DataTypes.INTEGER, allowNull: false },
    date: { type: DataTypes.DATE, allowNull: false },
    paymentMethod: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('Новая', 'Подтверждена', 'Отклонена', 'Завершена'), defaultValue: 'Новая', allowNull: false },
    review: { type: DataTypes.TEXT, allowNull: true },
    reason: { type: DataTypes.STRING, allowNull: true } // добавил для отклоненной заявки
});

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    requestId: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 10 }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { len: [10, 2000] }
    }
}, {
    timestamps: false
});


// Настройка ассоциаций с правильными именами

User.hasMany(Request, { foreignKey: 'userId', onDelete: 'CASCADE' });
Request.belongsTo(User, { foreignKey: 'userId' });

Service.hasMany(Request, { foreignKey: 'serviceId' });
Request.belongsTo(Service, { foreignKey: 'serviceId', as: 'Service' });

Request.hasOne(Review, { 
    foreignKey: 'requestId',
    as: 'Review',
    onDelete: 'CASCADE'
});
Review.belongsTo(Request, { foreignKey: 'requestId' });

User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

Service.hasMany(Review, { foreignKey: 'serviceId' });
Review.belongsTo(Service, { foreignKey: 'serviceId', as: 'Service' })

// Инициализация базы
async function initModels() {
    await sequelize.sync({ alter: true });
    // Создаем тестовые данные, если надо
    const adminExists = await User.findOne({ where: { login: 'admin' } });
    if (!adminExists) {
        const bcrypt = require('bcrypt');
        const hash = await bcrypt.hash('education', 10);
        await User.create({
            name: 'Администратор',
            phone: '+70000000000',
            email: 'admin@example.com',
            login: 'admin',
            password: hash,
            isAdmin: true
        });
        console.log('Админ создан: логин=admin, пароль=education');
    }
    // Можно добавить сервисы
    const countServices = await Service.count();
    if (countServices === 0) {
        await Service.bulkCreate([
            { name: 'Основы алгоритмизации и программирования' },
            { name: 'Основы веб-дизайна' },
            { name: 'Основы проектирования баз данных' }
        ]);
    }
    console.log('База инициализирована');
}


module.exports = {
    sequelize,
    User,
    Service,
    Request,
    Review,
    initModels
};