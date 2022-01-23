<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 2.存放报表的div -->
      <div style="width: 800px; height: 400px" id="main"></div>
    </el-card>
  </div>
</template>

<script>
// 1.导入Echarts
// 导入lodash
import _ from 'lodash'
const echarts = require('echarts')

export default {
  data() {
    return {
      // 鼠标跟随效果的options数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  async mounted() {
    // 3.初始化Echarts
    var myChart = echarts.init(document.getElementById('main'))

    // 4.准备数据和配置项
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取折线图数据失败！')
    }
    // 将接口获取的数据和鼠标跟随效果进行合并
    const result = _.merge(res.data, this.options)

    // 5.展示数据
    myChart.setOption(result)
  }
}
</script>

<style lang="less" scoped>
</style>
