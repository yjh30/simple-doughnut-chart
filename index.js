function extend(target, obj) {
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            target[p] = obj[p];
        }
    }
    return target;
}

function getIeVersion() {
    var matched = window.navigator.userAgent.match(/msie\s+([\d|.]+);/i);
    var result = matched && matched[1];

    return result ? Number(result, 10) : '';
}

/**
 * canvas  simple doughnut chart
 * @param  {HTMLElement} canvas canvas元素
 * @param  {Object} options 配置对象
 * @param  {Number} options.canvasSize canvas宽高大小
 * @param  {Number} options.doughnutSize 圆环直径大小
 * @param  {Number} options.defaultTextSize 默认文字大小
 * @param  {Number} options.activeTextSize 激活文本大小
 * @param  {String} options.defaultColor 圆环默认颜色
 * @param  {String} options.defaultTextColor 默认文本颜色
 * @param  {String} options.activeColor 圆环激活颜色
 * @param  {Number} options.percentage 百分比
 * @param  {Number} options.decimalPointDigit 保留的小数点位数
 * @param  {String} options.text 文本
 * @param  {Number} options.duration 动画持续时间
 * @param  {Number} options.dashWidth (百分比占位符)破折号宽
 * @param  {Number} options.dashHeight 破折号高
 * @param  {Number} options.dashMargin 破折号之间的间隔
 * @param  {Number} options.dashLength 破折号个数
 * @param  {String} options.dashColor 破折号颜色
 */

function DoughnutChart(canvas, options) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');

    this.options = {
        canvasSize: 0,
        doughnutSize: 0,
        defaultTextSize: 0,
        activeTextSize: 0,
        defaultColor: '#eee',
        defaultTextColor: '#eee',
        activeColor: '',
        percentage: -1,
        text: '',
        duration: 1500,
        dashWidth: 12,
        dashHeight: 4,
        dashMargin: 6,
        dashLength: 3,
        decimalPointDigit: 0
    };
    this.options = extend(this.options, options || {});
    this.ieVersion = getIeVersion();
    this.options.percentage = this.toFixed(this.options.percentage);
    this.adjustSize(this.options);

    this.initStyle();
    this.drawPercentage();
}

DoughnutChart.prototype = {
    adjustSize: function() {
        if (this.ieVersion && this.ieVersion < 9) {
            return;
        }

        for (var p in this.options) {
            if (p.match(/(size|width|height|margin)$/i)) {
                this.options[p] = this.options[p] * 2;
            }
        }
    },

    initStyle: function() {
        this.canvas.width = this.canvas.height = this.options.canvasSize;
        this.radius = this.options.canvasSize / 2;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.lineWidth = this.options.doughnutSize;
    },

    drawDefault: function() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.options.defaultColor;
        this.ctx.arc(this.radius, this.radius, this.radius - this.options.doughnutSize / 2, 0, 2 * Math.PI);
        this.ctx.stroke();

        if (this.options.text) {
            this.ctx.beginPath();
            this.ctx.font = this.options.defaultTextSize + 'px MicrosoftYaHeiUI';
            this.ctx.fillStyle = this.options.defaultTextColor;
            this.ctx.closePath();
            this.ctx.fillText(this.options.text, this.radius, this.radius + this.options.activeTextSize / 2);
        }
    },

    drawDash: function() {
        this.ctx.lineWidth = this.options.dashHeight;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = this.options.dashColor;

        var verticalPos = this.options.text === '' ? this.radius : this.radius - this.options.activeTextSize / 2;
        var drawItem = function(ctx, startPos, endPos, drawCount) {
            ctx.beginPath();
            ctx.moveTo(startPos, verticalPos);
            ctx.lineTo(endPos, verticalPos);
            ctx.stroke();

            if (--drawCount > 0) {
                startPos = endPos + this.options.dashMargin;
                endPos = startPos + this.options.dashWidth;
                drawItem.apply(this, [ctx, startPos, endPos, drawCount]);
            }
        };

        var totalW = this.options.dashWidth * this.options.dashLength + this.options.dashMargin * (this.options.dashLength - 1);
        var startPos = this.radius - totalW / 2;
        var endPos = startPos + this.options.dashWidth;

        drawItem.apply(this, [this.ctx, startPos, endPos, this.options.dashLength]);
    },

    drawPercentage: function(callback) {
        if (this.options.percentage < 0) {
            this.drawDefault();
            this.drawDash();
            return;
        }

        var self = this;
        var draw = function(percentage) {
            self.drawDefault();
            self.drawPercentageText(percentage);
            self.drawActiveDoughnut(percentage);
        };

        if (this.ieVersion && this.ieVersion < 9) {
            draw(this.options.percentage);
        } else {
            var startTime = Date.now();
            this.requestAnimationFrame(function frame() {
                self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
                var percentage = Math.min(self.options.percentage / 100, (Date.now() - startTime) / self.options.duration) * 100;
                percentage = percentage.toFixed(self.options.decimalPointDigit);

                draw(Math.min(percentage, self.options.percentage));

                if (percentage < self.options.percentage) {
                    self.requestAnimationFrame(frame);
                }
            });
        }
    },

    toFixed(num) {
        var power = Math.pow(10, this.options.decimalPointDigit);
        return parseInt(num * power, 10) / power;
    },

    drawPercentageText: function(percentage) {
        var verticalPos = this.options.text === '' ? this.radius : this.radius - this.options.activeTextSize / 2;

        this.ctx.beginPath();
        this.ctx.font = this.options.activeTextSize + 'px MicrosoftYaHeiUI';
        this.ctx.fillStyle = this.options.activeColor;
        this.ctx.closePath();
        this.ctx.fillText(percentage + '%', this.radius, verticalPos);
    },

    drawActiveDoughnut: function(percentage) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.options.activeColor;
        this.ctx.arc(this.radius, this.radius, this.radius - this.options.doughnutSize / 2, this.toRadians(-90), this.toRadians(percentage * 3.6 - 90));
        this.ctx.stroke();
    },

    toRadians: function(degrees) {
        return degrees * Math.PI / 180;
    },

    requestAnimationFrame: function(callback) {
        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(callback);
        } else {
            window.setTimeout(callback, 16);
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DoughnutChart;
}
