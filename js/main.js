Vue.component('kanban-board',{
    template:`
        <div class="wrapper">
            <div v-if="isModalOpen" class="modal-overlay">
                <div class="modal">
                    <h2>Создать новую задачу</h2>
                    <label>
                        Название:
                        <input type="text" v-model="newTask.title" />
                    </label>
                    <label>
                        Описание:
                        <textarea v-model="newTask.description"></textarea>
                    </label>
                    <label>
                        Дедлайн:
                        <input type="datetime-local" v-model="newTask.deadline" />
                    </label>
                    <button @click="createTask">Создать</button>
                    <button @click="isModalOpen = false">Отмена</button>
                </div>
            </div>
            <header class="header">
                <h1>Kanban Доска</h1>
            </header>
            <main class="task-columns">
                <section    v-for="(tasks, columnName) in columns" :key="columnName" class="task-column"
                            @drop="onDrop(columnName, $event)" @dragover.prevent @dragenter.prevent>
                    <h2>{{ getColumnName(columnName) }}</h2>
                    <article v-for="(task, index) in tasks" :key="index" class="task-item" 
                            :draggable="!task.isEditing" @dragstart="startDrag(index, columnName, $event)">
                        <template  v-if="!task.isEditing">
                            <h3>{{ task.title }}</h3>
                            <p>{{ task.description }}</p>
                            <p>Дата создания: {{ formatDate(task.createdAt) }}</p>
                            <p  v-if="task.changedAt">Дата изменения:  {{ formatDate(task.changedAt) }}</p>
                            <p v-if="task.deadline">Дедлайн: {{ formatDate(task.deadline) }}</p>
                            <div v-if="columnName === 'inWork' && task.causes && task.causes.length">
                                Причины возврата:
                                <ol>
                                    <li v-for="(cause, causeIndex) in task.causes" :key="causeIndex">{{ cause }}</li>
                                </ol>
                            </div>
                            <p v-if="columnName === 'completed'">
                                <span v-if="task.isExpired">Задача просрочена</span>
                                <span v-else>Задача выполнена вовремя</span>
                            </p>
                            <div v-if="columnName === 'test' && task.causes && task.causes.length">
                                Причина возврата: 
                                <ol>
                                    <li v-for="(cause, causeIndex) in task.causes" :key="causeIndex">{{ cause }}</li>
                                </ol>
                            </div>
                            <button  v-if="columnName !== 'completed'" @click="editTask(columnName, index)">Изменить</button>
                            <button v-if="columnName === 'planed'" @click="deleteTask(columnName, index)">Удалить</button>
                            <button  v-if="columnName === 'planed'" @click="moveTask(columnName, index, 'inWork')">В работу</button>
                            <button  v-if="columnName === 'inWork'" @click="moveTask(columnName, index, 'test')">В тестирование</button>
                            <button  v-if="columnName === 'test'" @click="moveTask(columnName, index, 'completed')">Выполнено</button>
                            <button  v-if="columnName === 'test'" @click="task.isReturning = true">Вернуть в работу</button>
                            <template v-if="task.isReturning"> 
                                <label>
                                    Причина возврата: 
                                    <input type="text"  v-model="task.returnCause">
                                </label> 
                                <button @click="returnTask(columnName, index, task.returnCause)">Подтвердить</button>
                            </template>
                        </template>
                        <template v-else>
                            <label>
                                Название:
                                <input type="text"  v-model="task.editModel.title">
                            </label>
                            <label>
                                Описание:
                                <textarea v-model="task.editModel.description"></textarea>
                            </label>
                            <label>
                                Дедлайн:
                                <input type="datetime-local" v-model="task.editModel.deadline">
                            </label>
                            <button @click="saveChanges(columnName, index)">Сохранить</button>
                        </template>
                    </article>
                    <template  v-if="columnName === 'planed'">
                        <button v-if="columnName === 'planed'" @click="openModal">Создать новую задачу</button>
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
            isModalOpen:false,
        }
    },
    methods:{
        saveToLocalStorage(){
            localStorage.setItem('kanbanData', JSON.stringify(this.columns))
        },
        loadFromLocalStorage(){
            const data = localStorage.getItem('kanbanData');
            if(data){
                this.columns = JSON.parse(data)
            }
        },
        openModal(){
            this.isModalOpen = true;
        },
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
            this.saveToLocalStorage();
        },
        editTask(columnName, index){
            this.columns[columnName][index].isEditing = true;
            this.saveToLocalStorage();
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
            this.saveToLocalStorage();
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
            this.saveToLocalStorage();
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
            this.saveToLocalStorage();
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
        },

    },
    mounted() {
        this.loadFromLocalStorage();
    }
});
new Vue({
    el:'#app',
});
