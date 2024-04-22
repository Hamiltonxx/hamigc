<template>
    <div class="container">
        <!-- logo -->
        <div class="logo">
            <img src="../../assets/images/logo.jpeg" alt="logo" />
            <span>Python</span>
        </div>
        <!-- 登录框 -->
        <div class="wrapper">
            <div class="title">登录</div>

            <div class="form">
                <el-input 
                    v-model="form.username" 
                    clearable 
                    size="large"
                    style="height: 50px"
                    placeholder="请输入手机号"
                >
                    <template #prepend>
                        <el-button size="large" :icon="Iphone" />
                    </template>
                </el-input>

                <div class="getCode">
                    <el-input 
                        class="code-input"
                        v-model="form.code" 
                        clearable 
                        size="large"
                        placeholder="点击获取自动填写"
                        @keydown="handleSubmit"
                    >
                        <template #prepend>
                            <el-button size="large" :icon="Lock" />
                        </template>
                    </el-input>

                    <div class="button" @click="handleGetCode">获取验证码</div>
                </div>

                <div class="submit" @click="handleSubmit">登录</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ElInput, ElButton, ElMessage } from 'element-plus';
import { Iphone, Lock } from '@element-plus/icons-vue';
import { reactive } from 'vue';
import { request } from '../../lib/request';
import { useRouter } from 'vue-router';

const router = useRouter();

const form = reactive({
    username: null,
    password: null,
    code: null,
});

/**
 * 获取验证码
 */
function handleGetCode() {
    if (!form.username) return ElMessage.error(请填写手机号);

    request({
        url: '/send_vericode',
        method: 'post',
        data: {
            phone: form.username
        },
        success: function (res) {
            form.code = res.vericode;
        },
        fail: function (err) {
            ElMessage.error('获取验证码错误');
            console.log(err);
        }
    });
}

/**
 * 提交
 */
function handleSubmit() {
    const r = valid();

    if (!r) return ;

    request({
        url: '/vericode_login',
        method: 'post',
        data: {
            phone: form.username,
            vericode: form.code
        },
        success: function (res) {
            localStorage.setItem('python.user', JSON.stringify(res));

            router.push('/coding');
        },
        fail: function (err) {
            ElMessage.error('登录失败');
            console.log(err);
        }
    });
}

/**
 * 验证是否填写完整
 */
function valid() {
    if (!form.username) {
        ElMessage.error('请填写手机号');

        return false;
    }

    if (!form.code) {
        ElMessage.error('请填写验证码');

        return false;
    }

    return true;
}

</script>

<style lang="less" scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    .logo {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        width: 50%;
        height: 100%;
        background-color: #2f2f2f;
        img {
            width: 600px;
        }
        span {
            color: #fff;
            font-size: 50px;
        }
    }
    .wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        width: 50%;
        height: 100%;
        .title {
            font-size: 28px;
            letter-spacing: 20px;
            text-align: center;
            margin-bottom: 20px;
        }
        .form {
            width: 400px;
        }
        .getCode {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            margin-top: 20px;
            .code-input {
                width: 50%;
                height: 50px;
            }
            .button {
                width: 180px;
                height: 50px;
                background-color: #2f2f2f;
                color: #fff;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                margin-left: 20px;
                text-align: center;
                line-height: 50px;
                &:active {
                    opacity: .8;
                }
            }
        }
        .submit {
            width: 100%;
            height: 50px;
            margin-top: 20px;
            background-color: #2f2f2f;
            color: #fff;
            font-size: 16px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            text-align: center;
            line-height: 50px;
            &:active {
                opacity: .8;
            }
        }
    }
}
</style>