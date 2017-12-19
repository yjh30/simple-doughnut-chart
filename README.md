
# simple doughnut chart

## 安装

``` bash
npm i --save simple-doughnut-chart
```


## 特点
* 兼容所有浏览器（包括ie6,7,8），需引入excanvas.js，请看git仓库示例代码
* 更好的支持retina屏
* 支持过渡动画（ie9及其他主流浏览器）


## 使用

``` js
import DoughnutChart from 'simple-doughnut-chart';

new DoughnutChart(document.getElementById('canvas'), {
    canvasSize: 150,            // canvas宽高大小
    doughnutSize: 12,           // 圆环直径大小
    defaultTextSize: 15,        // 默认文字大小
    activeTextSize: 25,         // 激活文本大小
    defaultColor: '#eee',       // 圆环默认颜色
    defaultTextColor: '#ccc',   // 默认文本颜色
    activeColor: '#13b0df',     // 圆环激活颜色
    percentage: 88,             // 百分比，text不传或值为空字符串，则居中显示
    decimalPointDigit: 0,       // 保留的小数点位数，默认为0
    text: '正确率',              // 文本
    duration: 1500,             // 动画持续时间
    dashWidth: 12,              // (百分比占位符)破折号宽
    dashHeight: 4,              // 破折号高
    dashMargin: 6,              // 破折号之间的间隔
    dashLength: 3               // 破折号个数
    dashColor: 3               // 破折号颜色
});
```


## 预览图
![](./img/review1.png)
![](./img/review2.png)
