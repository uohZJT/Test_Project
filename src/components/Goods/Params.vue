<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon>
      </el-alert>

      <!-- 选择商品分类 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader v-model="selectedCateKeys" :options="cateList" :props="cateProps" @change="handleChange"></el-cascader>
        </el-col>
      </el-row>

      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" style="width: 100%">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">
                  {{item}}
                </el-tag>
                <!-- 添加tag标签 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInputRef" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作" width="300">
              <template slot-scope="scope">
                <!-- 编辑按钮 -->
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <!-- 删除按钮 -->
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData" style="width: 100%">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">
                  {{item}}
                </el-tag>
                <!-- 添加tag标签 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInputRef" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称">
            </el-table-column>
            <el-table-column label="操作" width="300">
              <template slot-scope="scope">
                <!-- 编辑按钮 -->
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <!-- 删除按钮 -->
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数和属性对话框 -->
    <el-dialog :title="'添加'+ titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数和属性对话框 -->
    <el-dialog :title="'修改'+ titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 已选择的分类
      selectedCateKeys: [],
      // 级联选择器的props
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },

      // 被选中的tab页签
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],

      // 添加动态参数/静态属性对话框可见性
      addDialogVisible: false,
      // 添加属性的表单域
      addForm: {
        attr_name: ''
      },
      // 添加属性的验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: `请输入${this.titleText}名称`, trigger: 'blur' },
          { min: 1, message: '最少输入1字符', trigger: 'blur' }
        ]
      },

      // 修改动态参数/静态属性对话框可见性
      editDialogVisible: false,
      // 修改属性的表单域
      editForm: {
        attr_name: ''
      },
      // 修改属性的验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: `请输入${this.titleText}名称`, trigger: 'blur' },
          { min: 1, message: '最少输入1字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.cateList = res.data
    },

    // 级联选择器change事件
    handleChange() {
      this.getParamsData()
    },

    // 点击tab页签触发的处理函数
    handleClick() {
      this.getParamsData()
    },

    // 获取参数列表
    async getParamsData() {
      // 选中的不是三级分类，则将选中结果和表格数据清空，并返回提示消息
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return this.$message.warning('请选择三级分类')
      }
      // 如果选中的是三级分类，则调用API获取参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败！')
      }
      // 对每个参数进行循环，获取val值，将字符串转化为数组
      res.data.forEach((item) => {
        // 如果值为空，则返回一个空数组
        item.attr_vals = item.attr_vals === '' ? [] : item.attr_vals.split(',')
        // 为每个参数添加一个inputVisiable
        item.inputVisible = false
        // 为每个参数绑定一个inputValue
        item.inputValue = ''
      })
      // 如果tab是many，则将数据保存到动态参数中
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 添加属性/参数对话框关闭函数
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击“确定”后调用添加的API
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error(`请完善${this.titleText}的名称！`)
        }
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error(`添加${this.titleText}失败！`)
        }
        this.$message.success(`添加${this.titleText}成功！`)
        this.getParamsData()
        this.addDialogVisible = false
      })
    },

    // 修改对话框
    async showEditDialog(attrId) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error(`获取${this.titleText}失败！`)
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 修改属性/参数对话框关闭函数
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
      this.editForm = { attr_name: '' }
    },
    // 点击“确定”后调用修改的API
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error(`请完善${this.titleText}的名称！`)
        }
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) {
          return this.$message.error(`修改${this.titleText}失败！`)
        }
        this.$message.success(`修改${this.titleText}成功！`)
        this.getParamsData()
        this.editDialogVisible = false
      })
    },

    // 定义删除的处理函数
    async removeParams(attrId) {
      const confirmDelete = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => {
        return err
      })
      if (confirmDelete === 'cancel') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败！')
      }
      this.$message.success('删除参数成功！')
      this.getParamsData()
    },

    // tag文本框失去焦点或按下了Enter键触发的函数
    handleInputConfirm(row) {
      // 如果输入的是空值，那么直接return
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果输入的不是空值，那么将该值添加到attr_vals数组中
      row.attr_vals.push(row.inputValue.trim())
      // 添加完成后，清空row.inputValue，便于下次使用
      row.inputValue = ''
      this.saveAttrVals(row)
      row.inputVisible = false
    },
    // 将tag值保存到数据库中的函数
    async saveAttrVals(row) {
      // 添加完成后需要发起请求，将数据保存到数据库中
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(',')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('属性值修改失败！')
      }
      this.$message.success('属性值修改成功！')
    },
    // 点击+New Tag按钮后触发的函数
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // 当页面上的元素被重新渲染后，才会执行$nextTick里的回调函数；使用$nextTick是为了防止inputVisible变为true后，页面上还没有input元素，因此要等待input元素被渲染出来后，再操作该元素
      this.$nextTick((_) => {
        this.$refs.saveTagInputRef.$refs.input.focus()
      })
    },

    // 删除tag标签
    handleClose(i, row) {
      // 使用splice方法将数组中的元素替换，返回新数组
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 如果按钮需要被禁用，则返回true，否则返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的分类ID
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 对话框名称
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin-top: 15px;
}
.el-tag {
  margin: 12px;
}
.input-new-tag {
  width: 150px;
}
</style>
