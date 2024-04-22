import axios from 'axios';
import router from '../router';

var host = 'https://py.cirray.cn:8005';


/**
 * 发送请求
 * @param {*} url 
 * @param {*} method 
 * @param {*} data 
 * @param {*} success 
 * @param {*} fail 
 */
export function request(options) {
    var token = '';

    try {
        token = JSON.parse(localStorage.getItem('python.user')).token;
    } catch (err) {};

    axios({
        url: host + options.url,
        method: options.method,
        data: options.data,
        headers: {
            authorization: "Bearer " + token
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
        console.log(err);
        if (err.response.status == 403) {
            router.replace('/login');
            return ;
        }

        options.fail(err);
    });
}