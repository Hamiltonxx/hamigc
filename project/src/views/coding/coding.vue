<template>
    <div class="container">
        <!-- 顶部 -->
        <div class="header">
            <div class="title">Python 教程</div>

            <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link">
                    {{ userphone }}
                <el-icon class="el-icon--right">
                    <arrow-down />
                </el-icon>
                </span>
                <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>

        <!-- 内容区域 -->
        <div class="content">
            <!-- 课程 -->
            <div class="classes">
                <el-collapse v-model="collection_active">
                    <el-collapse-item 
                        v-for="(item, index) in collections"
                        :key="index"
                        :title="item.name" 
                        name="1"
                    >
                        <div 
                            :class="['question', { problem_active: problem_active == item.id, problem_finish: item.finish }]"
                            v-for="(item, index) in problems" 
                            :key="index"
                            @click="handleSelectQuestion(item.id)"
                        >
                            <span class="arc" v-if="!item.finish"></span>
                            <el-icon 
                                class="iconfont"
                                v-else
                            >
                                <circle-check />
                            </el-icon>
                            <span class="title">{{ item.title }}</span>
                        </div>
                    </el-collapse-item>
                </el-collapse>
            </div>
            <!-- 题目 -->
            <div class="context">
                <div class="inside">
                    <h2>{{ question.title }}</h2>
                    <div class="des">
                        <div class="description" v-html="question.description ? question.description.split('\n').join('<br />') : ''"></div>
                        <el-button
                            size="large"
                            type="primary"
                            :icon="Check"
                            @click="handleSubmit"
                        >
                            提交
                        </el-button>
                    </div>
                    <div class="code-area">
                        <pre>
                            <code id="code" class="python" ref="code_dom"></code>
                        </pre>
                        <code 
                            autofocus 
                            contenteditable
                            @input="handleInput()"
                            id="textarea"
                            spellcheck="false"
                            ref="textarea_dom"
                        ></code>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { 
    ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon,
    ElCollapse, ElCollapseItem, ElMessage, ElButton  
} from 'element-plus';
import { ArrowDown, Check, CircleCheck } from '@element-plus/icons-vue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { request } from '../../lib/request';

const router = useRouter();

const collections = ref([]);
const collection_active = ref('1');
const problems = ref([]);
const problem_active = ref(0);

const textarea_dom = ref(null);
const code_dom = ref(null);


getCollections();


// 用户手机号
const userphone = computed(() => {
    let phone = '';

    try {
        phone = JSON.parse(localStorage.getItem('python.user')).phone;
    } catch(err) {};

    return phone;
});

const question = computed(() => {
    const target = problems.value.find(problem => problem.id == problem_active.value);

    if (target) {
        code_dom.value.innerHTML = target.codeinit.replace(/\r\n/g,"<br>");
        textarea_dom.value.innerText = target.codeinit.replace(/\t/g, "        ");

        init();
    }

    return target ? target : {};
});

// 提交
function handleSubmit() {
    request({
        url: '/submission',
        method: 'post',
        data: {
            pid: problem_active.value,
            codes: textarea_dom.value.innerText
        },
        success: function (res) {
            ElMessage.success('提交成功');
            getSubmissions();
        },
        fail: function (err) {
            ElMessage.error('提交失败');
        }
    });
}

// 下拉事件
function handleCommand(command) {
    switch(command) {
        case 'logout':
            router.replace('/login');
        break;
    }
}

// 选择题目
function handleSelectQuestion(id) {
    problem_active.value = id;
}

// 输入代码
function handleInput() {
    let code = textarea_dom.value.innerText.replace(/\r\n/g,"<br>");

    code_dom.value.innerHTML = code;

    init();
}

/**
 * 获取课程
 */
function getCollections() {
    request({
        url: '/collections',
        method: 'get',
        success: function (res) {
            collections.value = res;

            getProblems();
        },
        fail: function (err) {
            ElMessage.error('获取课程失败');
            console.log(err);
        }
    });
}

/**
 * 获取题目
 */
function getProblems() {
    request({
        url: '/problems',
        method: 'get',
        success: function (res) {
            problems.value = res;

            problem_active.value = res[0].id;

            getSubmissions();
        },
        fail: function (err) {
            ElMessage.error('获取题目失败');
            console.log(err)
        }
    });
}

/**
 * 获取已答过的题目
 */
 function getSubmissions() {
    request({
        url: '/my_submissions',
        method: 'get',
        success: function (res) {
            rendClasses(res);
        },
        fail: function (err) {
            errorAlert("获取提交列表失败");
        }
    });
}

function rendClasses(res) {
    let s = new Set();

    res.forEach(item => {
        s.add(item.pid);
    });

    s = [...s];

    s.forEach(item => {
        problems.value.forEach(problem => {
            if (item == problem.id) {
                problem.finish = true;

                getCodeInit(problem.id, res);
            }
        });
    });
}

// 渲染最后一次提交的答案
function getCodeInit(id, result) {
    let t = [];

    result.forEach(item => {
        if (item.pid == id) t.push(item);
    });

    t = t[t.length - 1];

    problems.value.forEach(item => {
        if (item.id == t.pid) {
            item.codeinit = t.codes;
        }
    });
}

function init() {
    code_dom.value.removeAttribute('data-highlighted');

    hljs.highlightAll();
}

</script>

<style lang="less" scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;
    .header {
        width: 100%;
        height: 60px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
        box-sizing: border-box;
        border-bottom: 1px solid #e8e8e8;
        background-color: #fff;
    }
    .content {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: calc(100% - 60px);
        .classes {
            width: 300px;
            height: 100%;
            overflow: auto;
            background-color: #fff;
            color: #333;
            padding-left: 20px;
            box-sizing: border-box;
            border-right: 1px solid #e8e8e8;
            .question {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                width: 100%;
                height: 40px;
                cursor: pointer;
                padding-left: 20px;
                color: #666;
                &:hover {
                    background-color: #e8e8e8;
                }
            }
            .problem_active {
                color: #333;
                background-color: #e8e8e8;
            }
            .problem_finish {
                color: #67C23A;
            }
            .arc {
                display: inline-block;
                width: 15px;
                height: 15px;
                border: 1px solid #999;
                border-radius: 50%;
            }
            .iconfont {
                font-size: 18px;
            }
            .title {
                padding-left: 10px;
            }
        }
        .context {
            flex: 1;
            height: 100%;
            box-sizing: border-box;
            padding: 20px;
            .inside {
                width: 100%;
                height: 100%;
                background-color: #fff;
                padding: 20px;
                box-sizing: border-box;
                border-radius: 8px;
                overflow: auto;
                .des {
                    max-width: 1000px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }
                .description {
                    max-width: 800px;
                    line-height: 24px;
                    font-size: 16px;
                    color: #333;
                    margin-top: 20px;
                }
            }
        }
    }
}

.code-area {
    position: relative;
    max-width: 1000px;
    min-height: 500px;
    border-radius: 4px;
    background-color: #1b1b1b;
    box-shadow: 0 0 10px rgba(0,0,0,.15);
    font-size: 14px;
}

pre code.hljs {
    padding: 16px !important; 
}
pre {
    margin-top: 20px;
    height: 100%;
    min-height: 500px;
}
code {
    outline: none;
    height: 100%;
    min-height: 500px;
    font-size: 16px;
}
#textarea {
    position: absolute;
    top: 15px;
    left: 0;
    width: 100%;
    height: 100%;
    color: transparent;
    outline: none;
    caret-color: #fff;
    padding: 16px;
    box-sizing: border-box;
    font-size: 16px;
    white-space: pre-wrap;
}
</style>