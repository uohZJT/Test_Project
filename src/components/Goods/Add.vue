<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" show-icon center :closable="false">
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <!-- tab页 -->
        <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateProps" @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品动态参数 -->
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染列表的属性 -->
            <el-form-item v-for="item in this.manyTableData" :key="item.attr_id" :label="item.attr_name">
              <!-- 渲染属性的值 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(subItem,i) in item.attr_vals" :key="i" :label="subItem" border>
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品静态属性 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in this.onlyTableData" :key="item.attr_id" :label="item.attr_name">
              <!-- 渲染属性的值 -->
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品图片 -->
          <el-tab-pane label="商品图片" name="3">
            <!-- action表示图片要上传到的API接口 -->
            <!-- 由于该组件没有调用axios，因此要设置请求头:headers，并包含sessionstorage中的token -->
            <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="uploadHeaders" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <!-- 商品内容 -->
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑框 -->
            <quill-editor v-model="addForm.goods_introduce">
            </quill-editor>
            <!-- 添加商品按钮 -->
            <el-button class="addGoodsBtn" type="primary" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog :title="'图片预览：'+this.picInfo.name" :visible.sync="picDialogVisible" width="50%">
      <img class="previewPic" :src="this.picInfo.url" alt="">
    </el-dialog>
  </div>
</template>

<script>
// 引入鲁大师
import _ from 'lodash'

export default {
  data() {
    return {
      // 步骤条激活索引
      activeIndex: '0',

      // 添加商品表单域
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        // 商品图片
        pics: [],
        // 商品详细描述
        goods_introduce: '',
        // 商品的参数
        attrs: []
      },
      // 添加商品的验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { min: 1, message: '最少输入 1 个字符', trigger: 'blur' }
        ],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
      },
      // 商品分类
      cateList: [],
      // 级联选择器的属性
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },

      // 动态参数列表数组
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],

      // 上传图片的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传请求头部
      uploadHeaders: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览信息
      picInfo: {
        name: '',
        url: ''
      },
      // 图片预览对话框可见性
      picDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.cateList = res.data
    },
    // 分类更改
    handleChange() {
      // 如果选择的不是三级分类，则将值制空并报错
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        return this.$message.error('请选择三级分类！')
      }
    },

    // 判断是否选择三级分类，没选择不允许切换tab页签
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择三级分类后，再切换tab页签！')
        return false
      }
    },

    // tab切换时触发的函数
    async tabClicked() {
      // 点击商品参数tab页时，触发获取分类参数的API
      if (this.activeIndex === '1') {
        // 如果跳转到第1页，则获取动态参数
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'many'
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数失败！')
        }
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        // 如果跳转到第2页，则获取静态属性
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'only'
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败！')
        }
        this.onlyTableData = res.data
      }
    },

    // 上传图片的预览
    handlePreview(file) {
      this.picInfo.name = file.name
      this.picInfo.url = file.url
      this.picDialogVisible = true
    },
    // 移除图片的函数
    handleRemove(file) {
      // 1.获取要删除文件的临时路径
      const filePath = file.response.data.tmp_path
      // 2.在addForm的pics数组中找到要删除的文件，获取它的索引
      const i = this.addForm.pics.findIndex((x) => x.pic === filePath)
      this.addForm.pics.splice(i, 1)
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      // 1.接收一个图片信息
      const picInfo = { pic: response.data.tmp_path }
      // 2.将信息存入pics中
      this.addForm.pics.push(picInfo)
    },

    // 添加商品函数
    addGoods() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请完善必填信息！')
        }
        // 深拷贝一个表单用来提交
        const submitForm = _.cloneDeep(this.addForm)

        // 将数组类型的分类转化为以“，”分隔的字符串
        submitForm.goods_cat = submitForm.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          submitForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          submitForm.attrs.push(newInfo)
        })
        // 发起添加商品的请求
        const { data: res } = await this.$http.post('goods', submitForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        // 跳转到商品列表
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 定义被选中的三级分类ID
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 5px 0 0 !important;
}
.previewPic {
  width: 100%;
  height: 100%;
}
.addGoodsBtn {
  margin-top: 15px;
}
</style>
