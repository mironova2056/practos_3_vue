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
});