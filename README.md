# bots, middlewares and typescript

Появилась мысль сделать бота для своих околорабочих целей. Для простоты разработки был выбран старый добрый фреймворк `Telegraf`,  в который еще и относительно недавно завезли тайпинги для Typescript. Звучит хорошо, посмотрим как это будет на деле.

При очередной доработке бота появилась необходимость в сложных цепочках исполнения, например, для последовательных вопросов пользователю и заполнения данных, без захламления кода условиями. Telegraf имеет для этого `Stage` `Scene`, но тайпинги на него отсутствуют, а плясать с бубном с надписью Typescript не очень хочется. Поэтому решено переписать его на том функционале Telegraf, который доступен.


### Как работает Telegraf
В Telegraf все плагины и обработчики это паттерн Middleware.
```ts
    function(context, next){
        ...some actions
        next();
    }
``` 

*Класс Telegraf*  - является расширением класса Composer. Отличается настройками доступа к api.telegram.org и прокси.

*Класс Composer* - класс предоставляющий удобный интерфейс для подписки на события бота: 
```ts
bot.hears('sometext', middleware);
bot.command('/start', middleware);
bot.on('document'|'message'| updateType, middleware)
```
Важно то что все эти подписки можно подключить к главной цепи исполнения через 
```ts
bot.use(composer.middleware());
```
У класса есть статические методы которые позволяют комбинировать Middleware как душе угодно.
- `Composer.compose` - Комбинирует список Middleware в одну.
- `Composer.optional` - Генерирует Middleware, которая отрабатывает только если `condition === true`
```ts
const OptionalMiddleware = Composer.optional(true | ctx => true, ctx => ctx.reply('this will work'));
```
- `Composer.branch` - Генерирует if/else развилку.
```ts
const BranchMiddleware = Composer.branch(boolean, ctx => ctx.reply('this will work if true'), ctx => ctx.reply('this will work if false'));
const BranchMiddleware = Composer.branch(ctx => boolean, ctx => ctx.reply('this will work if true'), ctx => ctx.reply('this will work if false'));
```

# Зачем нужны сцены
Для заполнения данных пользователем, необходимо держать его в контексте этой "формы" какое-то время, не отвлекаясь на другие обработчики. В моей задаче необходимо было задать пользователю несколько вопросов с валидацией его ответов. Сцена в конкретном примере позволяет заблокировать исполнение бота в рамках конкретного вопроса до тех пор, пока пользователь не выйдет из сцены (посредством команды `/cancel` например) или не пройдет валидацию конкретного вопроса. Каждый вопрос будет отдельной сценой, блокирующей нить исполнения для конкретного пользователя. Набор вопросов таким образом можно реализовать на основе нескольких сцен открывающихся друг за другом. Для того чтобы разные пользователи могли параллельно заполнять разные формы необходимо где-то хранить состояние каждого из них, а конкретно текущую сцену(или ее отсутствие). 

# Реализация SessionManager
Для сохранения состояния сцен и прочих данных пользователей применяются сессии.
Внутри сессии можно хранить как идентификатор сцены, так и прочие данные конкретного пользователя.
Контекст Telegraf расширяем посредством дженериков, таким образом можно добавлять туда свои поля. Также Telegraf рекомендует хранить такие данные в `ctx.state`.
Получаем следующее описание контекста TBotContext.

```ts
export interface ISceneManagerHooks {
    enter?: (sceneId: string) => Promise<any>;
    leave?: () => void;
}

export interface ISessionContext {
    state: {
        session: {
            scenes: {
                activeSceneId: string,
            }
            ...otherUserData,
        };
    };
}

export interface ISceneContext {
    scene: ISceneManagerHooks;
}
export type TBotContext = ISessionContext &
    ISceneContext &
    ContextMessageUpdate;
```
Как видно, структура позволяет вход/выход из сцены посредством `ctx.scene.enter(sceneId)` `ctx.scene.leave()` и получать доступ к сессии через `ctx.state.session`. Идентификатор текущей сцены хранится в `ctx.state.action.scenes.activeSceneId`

Простейший пример реализации сессии приведен ниже:
``` ts
class Session {
...
middleware() {
        return async (ctx: TBotContext, next: () => void) => {
            ctx.state.session = this.getOrCreateUserSession(ctx);
            await next(); // ждет выполнения всех Middleware после него
            this.commitUserSession(ctx); // и выполняет Commit данных которые изменились в сессии.
        };
    ]
}
```
В примере из репозитория сессии сделаны на основе lowdb с адаптером Memory. Таким образом, данные хранятся в памяти и будут очищены при перезагрузке сервера. 
  
# Реализация  SceneManager
С хранением идентификатора сцены разобрались. Теперь необходимо использовать Telegraf.Composer для создания менеджера сцен
```ts
class SceneManager {
    ...
    public middleware() {
        // Ветвление для обработки случаев нахождения пользователя в сцене 
        return Composer.branch(
            // Если пользователь в сцене
            this.checkSceneInProgressMiddleware,
            // Делаем несколько вещей
            Composer.compose([
                // Внедряем ctx.scene.leave метод в контекст для возможности выхода из текущей сцены
                this.injectLeaveHookMiddleware,
                // Внедряем ctx.scene.enter(sceneId) метод в контекст для возможности перехода в сцену.
                this.injectEnterHookMiddleware,
                // добавляем middleware от каждой из сцен
                ...Array.from(this.scenes).map(([key, scene]) => {
                    // middleware будет отрабатывать только если эта сцена сейчас активна
                    return Composer.optional(
                        ctx => this.getActiveSceneId(ctx) === key,
                        scene.middleware()
                    );
                }),
            ]),
            // Если никакая сцена не активна внедряем только ctx.scene.enter() метод для входа в сцену
            this.injectEnterHookMiddleware
        );
    }
}
```
Как видно если любая сцена активна то возможен переход в другую сцену и выход из нее, а если никакая сцена не активна, то возможен лишь переход в другую сцену.

Класс сцены для использования `scene.composer.hears,scene.composer.command,...` методов также использует под капотом `Telegraf.composer`
```js
export class Scene {
    public composer: Composer<TBotContext>;
    public id: string;
    public registeredHooks: ISceneHooks = {};

    constructor(id: string) {
        this.composer = new Composer();
        this.id = id;
    }

    public enter(handler: Middleware<TBotContext>) {
        this.registeredHooks.enter = handler;
    }
    public leave(handler: Middleware<TBotContext>) {
        this.registeredHooks.leave = handler;
    }

    public middleware(): Middleware<TBotContext> {
        return ((this.composer as unknown) as any).middleware();
    }
}
```

Пример использования:
```ts
const bot  = new Telegraf(Options);
const session = new Session();

const exampleScene = new Scene('exampleName');
exampleScene.enter(ctx => ctx.reply('entering an example scene'));
exampleScene.leave(ctx => ctx.reply('leaving an example scene'));
exampleScene.composer.hears('example', ctx => ctx.reply('inside of example scene'));
exampleScene.composer.command('/cancel', ctx => ctx.scene.leave());

const sceneManager = new SceneManager([exampleScene]);

bot.use(session.middleware());
bot.use(sceneManager.middleware());

bot.start(ctx => ctx.reply('welcome'));

bot.hears('show me an example scene', ctx => ctx.scene.enter('exampleName'));

bot.launch();
```

Релизация сцен и сессий является хорошим примером реализации сложных ветвлений и может быть полезна в других кейсах, подход к которым будет аналогичен.

Примеры создания цепочки вопросов с валидацией можно найти в репозитории где и представлены все исходники.
Полная документация и прочие примеры использования по данной библиотеке находятся [здесь](https://telegraf.js.org/#/).
