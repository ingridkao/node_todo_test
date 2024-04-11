function isValidTitle(title) {
    return /^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(title);
}

module.exports = {
    isValidTitle
};