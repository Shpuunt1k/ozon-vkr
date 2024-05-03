module.exports = class UserDto {
    email;
    id;
    isActivated;
    secretId;
    secretKey;

    constructor(model) {
        this.email = model.email;
        this.id = model.id;
        this.isActivated = model.isActivated;
        this.secretId = model.secretId
        this.secretKey = model.secretKey
    }
}
