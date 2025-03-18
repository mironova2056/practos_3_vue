Vue.component('kanban-board',{
    template:`
        <div class="wrapper">
            <header class="header">
                <h1>Kanban Доска</h1>
            </header>
            <main class="task-columns">
                <section class="task-columns">
                    <h2></h2>
                    <article class="task-item">
                        <template>
                            <h3></h3>
                            <p></p>
                            <p>Дата создания: </p>
                            <p>Дата изменения: </p>
                            <p>Дедлайн: </p>
                            <p v-if="columnName === 'completed'">
                                <span v-if="">Задача просрочена</span>
                                <span v-else>Задача выполнена вовремя</span>
                            </p>
                            <div>
                                Причина возврата: 
                                <ol>
                                    <li></li>
                                </ol>
                            </div>
                            <button>Изменить</button>
                            <button>Удалить</button>
                            <button>В работу</button>
                            <button>В тестирование</button>
                            <button>Выполнено</button>
                            <button>Вернуть в работу</button>
                            <template> 
                                <label>
                                    Причина возврата: 
                                    <input type="text">
                                </label> 
                                <button>Подтвердить</button>
                            </template>
                        </template>
                        <template v-else>
                            <label>
                                Название:
                                <input type="text">
                            </label>
                            <label>
                                Описание:
                                <textarea></textarea>
                            </label>
                            <label>
                                Дедлайн:
                                <input type="datetime-local">
                            </label>
                            <button>Сохранить</button>
                        </template>
                    </article>
                    <template>
                        <button>Создать новую задачу</button>
                        <article v-else class="task-item">
                            <label>
                                Название:
                                <input type="text">
                            </label>
                            <label>
                                Описание:
                                <textarea></textarea>
                            </label>
                            <label>
                                Дедлайн:
                                <input type="datetime-local">
                            </label>
                            <button>Создать</button>
                            <button>Отмена</button>
                        </article>
                    </template>
                </section>    
            </main>
        </div>
    `,
    data(){
        return{
            columns:{
              planed:[],
              inWork:[],
              test:[],
              completed:[]
            },
            isCreating:false,
            newTask:{
                title:'',
                description:'',
                deadline:'',
            },
            columnNames:{
                planed:'Запланированные задачи',
                inWork:'Задачи в работе',
                test:'Тестирование',
                completed:'Выполненные задачи',
            },
        }
    },
    methods:{
      getColumnName(columnName){
          return this.columnNames[columnName];
      },
      formatDate(date){
          if (!date) return '';
          return new Intl.DateTimeFormat('ru',{
              hour:'numeric',
              minute:'numeric',
              day:'numeric',
              month:'numeric',
              year:'numeric',
          }).format(new Date(date));
      },
      createTask(){
          const task = {
              ...this.newTask,
              createdAt:new Date(),
              changedAt:new Date(),
              isEditing:false,
              isReturning:false,
              returnCause:'',
              editModel:{...this.newTask}
          };
          this.columns.planed.push(task);
          this.isCreating = false;
          this.newTask = {title: '', description:'',deadline:'',};
      },
      editTask(columnName, index){
          this.columns[columnName][index].isEditing = true;
      },
      saveChanges(columnName, index){
          const task = this.columns[columnName][index];
          task.title = task.editModel.title;
          task.description = task.editModel.description;
          task.deadline = task.editModel.deadline;
          task.changedAt = new Date();
          task.isEditing = false;
      },
      deleteTask(columnName, index){
          this.columns[columnName].splice(index,1);
      },
      moveTask(fromColumn, index, toColumn, cause=null){
          const task = this.columns[fromColumn].splice(index,1)[0];
          if(toColumn === 'completed'){
              task.isExpired = new Date() > new Date(task.deadline);
          }
          if(cause){
              task.causes = task.causes || [];
              task.causes.push(cause);
          }
          this.columns[toColumn].push(task);
      },
      returnTask(fromColumn, index, cause){
          const task = this.columns[fromColumn][index];
          if(!task){
              console.error('Задача не найдена');
              return;
          }
          this.moveTask(fromColumn,index,'inWork', cause);
          if(task){
              task.isReturning = false;
          }
      },
      startDrag(index, columnName, event){
          event.dataTransfer.setData('task-index', index);
          event.dataTransfer.setData('from-column', columnName);
      },
      onDrop(toColumn, event){
          const taskIndex = event.dataTransfer.getData('task-index');
          const fromColumn = event.dataTransfer.getData('from-column');
          if(toColumn === 'planed')return;
          this.moveTask(fromColumn,taskIndex,toColumn);
      }
    },
});
new Vue({
    el:'#app',
});
