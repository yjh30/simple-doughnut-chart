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
 * @param  {Number} options.defaultTextSize 默认文本大小
 * @param  {Number} options.activeTextSize 激活文本大小
 * @param  {Number} options.percentTextSize 百分数文字大小(等同于激活文本大小)
 * @param  {String} options.defaultColor 圆环默认颜色
 * @param  {String} options.defaultTextColor 默认文本颜色
 * @param  {String} options.activeColor 圆环激活颜色
 * @param  {String} options.activeTextColor 文本激活颜色
 * @param  {String} options.percentageColor 百分比文字颜色，如果未传，则为圆环激活颜色
 * @param  {Number} options.percentage 百分比
 * @param  {Number} options.decimalPointDigit 保留的小数点位数，默认为0，如果小数点末尾为0，则不显示
 * @param  {Number} options.forceDecimalPointDigit // 强制保留的小数点位数，默认为-1，不做强制处理，当值设置大于等于0时，且百分比小数点末尾为0，也将显示，将会覆盖decimalPointDigit的值
 * @param  {String} options.text 文本
 * @param  {Number} options.duration 动画持续时间
 * @param  {Number} options.dashWidth (百分比占位符)破折号宽
 * @param  {Number} options.dashHeight 破折号高
 * @param  {Number} options.dashMargin 破折号之间的间隔
 * @param  {Number} options.dashLength 破折号个数
 * @param  {String} options.dashColor 破折号颜色
 * @param  {String} options.textPosition 文本位置，默认为bottom，可选值(bottom|top)
 * @param  {Array} options.gradientColors 圆环线型渐变颜色值，如[red, green]
 */

function DoughnutChart(canvas, options) {
  this.canvas = canvas;
  this.ctx = this.canvas.getContext('2d');

  this.options = {
    canvasSize: 0,
    doughnutSize: 0,
    defaultTextSize: 12,
    activeTextSize: 12,
    percentTextSize: 0,
    defaultColor: '#eee',
    defaultTextColor: '#eee',
    activeColor: '#eee',
    activeTextColor: '#eee',
    percentage: -1,
    decimalPointDigit: 0,
    forceDecimalPointDigit: -1,
    text: '',
    duration: 1500,
    dashWidth: 12,
    dashHeight: 4,
    dashMargin: 6,
    dashLength: 3,
    dashColor: '#eee',
    textPosition: 'bottom',
    gradientColors: []
  };

  this.options = extend(this.options, options || {});
  this.ieVersion = getIeVersion();
  this.adjustSize(this.options);

  this.initStyle();
  this.textVerticalPositions = this.getTextVerticalPositions();
  this.drawEntrance();
}

DoughnutChart.prototype = {
  /**
   * 获取标题文本，百分比文本绘制的垂直位置
   * @return {Object}
   */
  getTextVerticalPositions() {
    var titlePos = this.radius;
    var percentPos = this.radius;
    var textSize = this.options.percentTextSize || this.options.activeTextSize;

    if (this.options.text) {
      if (this.options.textPosition === 'top') {
        percentPos += textSize / 2;
        titlePos -= textSize / 2;
      } else {
        percentPos -= textSize / 2;
        titlePos += textSize / 2;
      }
    }

    return {
      title: titlePos,
      percent: percentPos
    };
  },

  /**
   * 调整适用于retina视网膜的配置项，其中的配置项按一倍配置
   * @return {undefined}
   */
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

  /**
   * 初始化canvas大小，圆环半径，文本、笔触样式
   * @return {undefined}
   */
  initStyle: function() {
    this.canvas.width = this.canvas.height = this.options.canvasSize;
    this.radius = this.options.canvasSize / 2;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.lineWidth = this.options.doughnutSize;
  },

  /**
   * 默认绘制，绘制默认圆环，标题文本
   * @param  {String} textColor 文本颜色
   * @return {undefined}
   */
  drawDefault: function(textColor) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.options.defaultColor;
    this.ctx.arc(this.radius, this.radius, this.radius - this.options.doughnutSize / 2, 0, 2 * Math.PI);
    this.ctx.stroke();

    if (this.options.text) {
      this.ctx.beginPath();
      this.ctx.font = this.options.defaultTextSize + 'px MicrosoftYaHeiUI';
      this.ctx.fillStyle = textColor || this.options.defaultTextColor;
      this.ctx.closePath();
      this.ctx.fillText(this.options.text, this.radius, this.textVerticalPositions.title);
    }
  },

  /**
   * 绘制破折号(当百分比数小于0)
   * @return {undefined}
   */
  drawDash: function() {
    this.ctx.lineWidth = this.options.dashHeight;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = this.options.dashColor;

    var verticalPos = this.textVerticalPositions.percent;

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

  /**
   * 绘制入口，绘制默认圆环，标题文本，百分比，激活圆环
   * @return {undefined}
   */
  drawEntrance: function() {
    if (this.options.percentage < 0) {
      this.drawDefault();
      this.drawDash();
      return;
    }

    var self = this;
    var draw = function(percentage) {
      self.drawDefault(self.options.activeTextColor);
      self.drawPercentageText(percentage);
      self.drawActiveDoughnut(percentage);
    };

    if (this.ieVersion && this.ieVersion < 9 || !this.options.duration) {
      draw(this.toFixed(this.options.percentage));
    } else {
      var startTime = Date.now();
      this.requestAnimationFrame(function frame() {
        self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
        var percentage = Math.min(self.options.percentage / 100, (Date.now() - startTime) / self.options.duration) * 100;

        draw(self.toFixed(Math.min(percentage, self.options.percentage)));

        if (percentage < self.options.percentage) {
          self.requestAnimationFrame(frame);
        }
      });
    }
  },

  /**
   * 处理浮点型数字
   * @param  {Number} floatNum 整数/小数
   * @return {Number} fixed number
   */
  toFixed: function(floatNum) {
    var decimalPointDigit = this.options.decimalPointDigit;
    var forceDecimalPointDigit = this.options.forceDecimalPointDigit;
    var pointDigit = decimalPointDigit;

    if (forceDecimalPointDigit >= 0 && decimalPointDigit !== forceDecimalPointDigit) {
      pointDigit = forceDecimalPointDigit;
    }

    // 舍弃不保存的小数位，避免四舍五入
    var power = Math.pow(10, pointDigit);
    var num = parseInt(floatNum * power, 10) / power;

    // 强制补小数位
    if (forceDecimalPointDigit >= 0) {
      var digitStr = num.toString().split('.')[1];
      if (typeof digitStr === 'undefined' || digitStr.length < forceDecimalPointDigit) {
        return num.toFixed(pointDigit);
      }
    }
    return num;
  },

  /**
   * 绘制百分比数字
   * @param  {Number} percentage
   * @return {undefined}
   */
  drawPercentageText: function(percentage) {
    var textSize = this.options.percentTextSize || this.options.activeTextSize;

    this.ctx.beginPath();
    this.ctx.font = textSize + 'px MicrosoftYaHeiUI';
    this.ctx.fillStyle = this.options.percentageColor || this.options.activeColor;
    this.ctx.closePath();
    this.ctx.fillText(percentage + '%', this.radius, this.textVerticalPositions.percent);
  },

  /**
   * 绘制激活的圆环
   * @param  {Number} percentage
   * @return {undefined}
   */
  drawActiveDoughnut: function(percentage) {
    var strokeStyle = this.options.activeColor;
    var gradient;
    var gradientColors = this.options.gradientColors;

    if (gradientColors && gradientColors.length === 2) {
      gradient = this.ctx.createLinearGradient(this.radius, 0, this.radius, this.canvas.width);
      gradient.addColorStop(0, gradientColors[0]);
      gradient.addColorStop(1, gradientColors[1]);
      strokeStyle = gradient;
    }

    this.ctx.beginPath();
    this.ctx.strokeStyle = strokeStyle;
    this.ctx.arc(this.radius, this.radius, this.radius - this.options.doughnutSize / 2, this.toRadians(-90), this.toRadians(percentage * 3.6 -90));
    this.ctx.stroke();
  },

  /**
   * 角度转换为圆弧
   * @param  {Number} degrees
   * @return {Number} 弧度
   */
  toRadians: function(degrees) {
    return degrees * Math.PI / 180;
  },

  /**
   * 请求动画帧
   * @param  {Function} callback 请求动画帧回调
   * @return {undefined}
   */
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
