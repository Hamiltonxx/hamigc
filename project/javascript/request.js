var host = 'https://py.cirray.cn:8005';


/**
 * 发送请求
 * @param {*} url 
 * @param {*} method 
 * @param {*} data 
 * @param {*} success 
 * @param {*} fail 
 */
function request(options) {
    var token = '';

    try {
        token = JSON.parse(localStorage.getItem('python_token')).token;
    } catch (err) {};

    axios({
        url: host + options.url,
        method: options.method,
        data: options.data,
        headers: {
            token: token
        }
    })
    .then(function (res) {
        if (res.status == 200) {
            options.success(res.data);
        } else {
            options.fail(res.data);
        }
    })
    .catch(function (err) {
        options.fail(err);
    });
}