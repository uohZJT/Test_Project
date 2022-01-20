<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <tree-table class="treeTable" :data="cateList" :columns="columns" show-index :selection-type="false" :expand-type="false" index-text="#" border :show-row-hover="false">
        <!-- “是否有效”的插槽区域 -->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- “排序”的插槽区域 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
        <!-- “操作”的插槽区域 -->
        <template slot="opt" slot-scope="">
          <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handlePageChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCatedialogVisible" width="50%" @close="addCateDialogClosed">
      <!-- 属性填写区域 -->
      <el-form :model="addCateForm" :rules="addCateRules" ref="addCateFormRef" label-width="100px">
        <!-- 要添加的分类名称 -->
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <!-- 选择的父级分类 -->
        <el-form-item label="父级分类">
          <!-- options用来指定数据源 -->
          <!-- props用来指定数据对象 -->
          <el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps" @change="parentCateChanged" clearable change-on-select></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类
      cateList: [],

      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,

      // tree-table的columns
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        // “是否有效”模板列
        {
          label: '是否有效',
          prop: 'cat_deleted',
          type: 'template',
          template: 'isOk'
        },
        // “排序”模板列
        {
          label: '排序',
          prop: 'cat_level',
          type: 'template',
          template: 'order'
        },
        // “排序”模板列
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],

      // 添加分类对话框可见性
      addCatedialogVisible: false,

      // 添加分类的表单属性
      addCateForm: {
        // 要添加的分类名称
        cat_name: '',
        // 父级分类id
        cat_pid: 0,
        // 默认要添加的分类层级是一级
        cat_level: 0
      },

      // 添加分类表单验证
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ]
      },

      // 父级分类清单
      parentCateList: [],
      // 被选中的父级分类ID
      selectedKeys: [],
      // 级联选择器的props
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.total = res.data.total
      this.cateList = res.data.result
    },

    // 监听pagesize的变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },

    // 监听页码值改变事件
    handlePageChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },

    // 展示添加分类对话框
    showAddCateDialog() {
      this.addCatedialogVisible = true
      // 调用获取父分类的API
      this.getParentCateList()
    },

    // 获取父级分类数据
    async getParentCateList() {
      // type=2只获取一级和二级分类
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      // 将获取的数据存入parentCateList中
      this.parentCateList = res.data
    },

    // 父级分类变化
    parentCateChanged() {
      // 如果id长度不为0，则说明选择了父分类
      if (this.selectedKeys.length > 0) {
        // 将选中的分类传值给addCateForm的cat_pid
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 层级数刚好和selectedKeys的长度相等
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },

    // 点击确定按钮触发API
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCatedialogVisible = false
      })
    },

    // 关闭对话框清空数据
    addCateDialogClosed() {
      // 清空“分类名称”
      this.$refs.addCateFormRef.resetFields()
      // 清空“父分类选项”
      this.selectedKeys = []
      // 清空表单域的值
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
