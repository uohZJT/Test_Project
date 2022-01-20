<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>

      <template>
        <el-table :data="rolesList" border stripe style="width: 100%">
          <!-- 展开列 -->
          <el-table-column type="expand">
            <template slot-scope="scope">
              <!-- 渲染一级权限 -->
              <el-row :class="['bdbottom', i1 === 0? 'bdtop':'', 'vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
                <el-col :span="5">
                  <el-tag closable @close="removeTagById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="19">
                  <!-- 二级权限 -->
                  <el-row :class="[i2 === 0? '':'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                    <el-col :span="6">
                      <el-tag type="success" closable @close="removeTagById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <!-- 三级权限 -->
                    <el-col :span="18">
                      <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeTagById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column type="index" label="#">
          </el-table-column>
          <el-table-column prop="roleName" label="角色名称">
          </el-table-column>
          <el-table-column prop="roleDesc" label="角色描述">
          </el-table-column>
          <el-table-column label="操作" width="300px">
            <template slot-scope="scope">
              <!-- 编辑按钮 -->
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="editRole(scope.row.id)">编辑</el-button>
              <!-- 删除按钮 -->
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRole(scope.row.id)">删除</el-button>
              <!-- 分配权限按钮 -->
              <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%" @close="addRoleDialogClosed">
      <!-- 主题内容区域 -->
      <el-form :model="addRoleRuleForm" :rules="addRoleRules" ref="addRoleRuleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleRuleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleRuleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editRoleDialogVisible" width="50%">
      <!-- 主题内容区域 -->
      <el-form :model="editRoleForm" :rules="editRoleRules" ref="editRoleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogClosed">取 消</el-button>
        <el-button type="primary" @click="confirmEditRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <!-- 树形控件 -->
      <!-- prop表示树形结构每一个树枝的名称 -->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      // 添加角色对话框可见性
      addRoleDialogVisible: false,
      // 角色表单
      addRoleRuleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色规则
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 1, max: 5, message: '长度在 1 到 5 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ]
      },

      // 编辑角色的对话框可见性
      editRoleDialogVisible: false,

      // 编辑角色的作用域
      editRoleForm: {},

      // 编辑角色规则
      editRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 1, max: 5, message: '长度在 1 到 5 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ]
      },

      // 分配权限对话框可见性
      setRightDialogVisible: false,

      // 所有权限数据
      rightsList: [],

      // 树形结构的属性
      treeProps: {
        label: 'authName',
        children: 'children'
      },

      // 默认勾选树形节点
      defKeys: [],

      // 角色id
      roleId: ''
    }
  },

  created() {
    this.getRolesList()
  },

  methods: {
    // 获取所有角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
    },

    // 添加角色
    addRole() {
      this.$refs.addRoleRuleFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请输入必填项')
        }
        // 如果校验成功，则调用添加用户的额API
        const { data: res } = await this.$http.post('roles', this.addRoleRuleForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败！')
        }
        this.$message.success('添加角色成功！')
        // 重新调用获取角色的API
        this.getRolesList()
        // 隐藏对话框
        this.addRoleDialogVisible = false
        // 清空表单域
        this.$refs.addRoleRuleFormRef.resetFields()
      })
    },

    // 关闭添加角色对话框清空缓存
    addRoleDialogClosed() {
      this.$refs.addRoleRuleFormRef.resetFields()
      this.addRoleDialogVisible = false
    },

    // 获取角色信息
    async editRole(id) {
      const { data: res } = await this.$http.get(`roles/${id}`)

      if (res.meta.status !== 200) {
        return this.$message.error('获取角色权限失败！')
      }
      this.editRoleForm = res.data
      this.editRoleDialogVisible = true
    },

    // 关闭编辑角色对话框
    editRoleDialogClosed() {
      this.$refs.editRoleFormRef.resetFields()
      this.editRoleDialogVisible = false
    },

    // 提交编辑内容
    async confirmEditRole() {
      const { data: res } = await this.$http.put(`roles/${this.editRoleForm.roleId}`, {
        roleName: this.editRoleForm.roleName,
        roleDesc: this.editRoleForm.roleDesc
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改角色信息失败！')
      }
      this.$message.success('修改角色信息成功！')
      this.getRolesList()
      this.editRoleDialogVisible = false
    },

    // 删除角色
    async deleteRole(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => {
        return err
      })
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败！')
      }
      this.$message.success('成功删除角色！')
      this.getRolesList()
    },

    // 根据id删除角色的权限
    async removeTagById(role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => {
        return err
      })
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }
      this.$message.success('删除权限成功！')

      // 删除后不建议使用this.getRolesList()，因为会导致页面回流
      role.children = res.data
    },

    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightsList = res.data
      // 获取三级权限的勾选状态
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },

    // 通过递归的形式，获取角色下所有三级权限的id，并保存到delKeys中
    getLeafKeys(node, arr) {
      // 如果node节点不包含children属性，则是3级节点，将该节点添加到数组中
      if (!node.children) {
        return arr.push(node.id)
      }
      // 如果有children，则循环递归
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },

    // 关闭分配权限对话框
    setRightDialogClosed() {
      this.defKeys = []
    },

    // 为角色分配权限
    async allotRight() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })

      if (res.meta.status !== 200) {
        return this.$message.error('权限分配失败！')
      }

      this.$message.success('权限分配成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
// 使tag有间距
.el-tag {
  margin: 7px;
}
// 给tag加上边框线
.bdtop {
  border-top: 1px solid #eee;
}
// 给tag加下边框线
.bdbottom {
  border-bottom: 1px solid #eee;
}
// 另tag垂直居中
.vcenter {
  display: flex;
  align-items: center;
}
</style>
