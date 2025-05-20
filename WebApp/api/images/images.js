module.exports = (sequelize, DataTypes) => {

    Images = sequelize.define("images", {
        image_id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true
        },
        file_name: {
            type: DataTypes.STRING,
            // primaryKey: true
        },
        s3_bucket_path: {
            type: DataTypes.STRING,
            // primaryKey: true
        },
    },
    {
        timestamps: true,
        createdAt: 'date_created',
    }
    )

    return Images
}