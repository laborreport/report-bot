# bots, middlewares and typescript

Появилась мысль сделать бота для своих околорабочих целей. Для простоты разработки был выбран старый добрый фреймворк `Telegraf`,  в который еще и относительно недавно завезли тайпинги для Typescript. Звучит как хороший вариант. Ну не на обычном js писать же в самом деле?

При очередной доработке бота появилась необходимость в сложных цепочках исполнения, например для последовательных вопросов пользователю и заполнения данных, без захламления кода условиями. Мы же все хотим писать хороший код, верно? Telegraf имеет для этого Stage для формирования так называемых сцен (Scene). Но тайпинги на него отсутствуют, а подтягивать этот плагин через const `const Stage:any = require('Telegraf/Stage')` или `[через тайпинги](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html)`. Поэтому решено переписать его на том функционале Telegraf, который доступен.


### Как работает Telegraf
В Telegraf все плагины и обработчики это Middleware.
```js
    function(context, next){
        ...some actions
        next();
    }
``` 

*Класс Telegraf*  - является расширением класса Composer. Отличается настройками доступа до api.telegram.org, прокси.

*Класс Composer* - класс предоставляющий удобный интерфейс для подписки на события бота: 
```js
bot.hears('sometext', middleware);
bot.command('/start', middleware);
bot.on('document'|'message'| updateType, middleware)
```
Важно то что все эти подписки можно подключить к главной цепи исполнения через 
```js
bot.use(composer.middleware());
```
У класса есть статические методы которые позволяют комбинировать Middleware как душе угодно.

  - *Composer.compose* - Комбинирует список Middleware в одну.
  - *Composer.optional* - Генерирует Middleware, которая отрабатывает только если `condition === true`
    ```js
    const OptionalMiddleware = Composer.optional(true | ctx => true, ctx => ctx.reply('this will work'));
    ```
  - *Composer.branch* - Генерирует ifelse развилку.
    ```js
    const BranchMiddleware = Composer.branch(boolean, ctx => ctx.reply('this will work if true'), ctx => ctx.reply('this will work if false'));
    const BranchMiddleware = Composer.branch(ctx => boolean, ctx => ctx.reply('this will work if true'), ctx => ctx.reply('this will work if false'));

    ```
  - *Composer.filter* - TODO

# Реализация SessionManager
Для сохранения данных пользователей можно использовать сессии.
Простейший пример реализации сессии приведен ниже:
``` js
class Session {
...
middleware() {
        return async (ctx: TBotContext, next: () => void) => {
            ctx.session = this.getOrCreateUserSession(ctx);
            await next(); // ждет выполнения всех Middleware после него
            this.commitUserSession(ctx); // и выполняет Commit данных которые изменились в сессии.
        };
    ]
}
```
В примере из архива сессии сделаны на основе lowdb с адаптером Memory. Таким образом, данные хранятся в памяти и будут очищены при перезагрузке сервера. 
  
# Реализация  SceneManager
SceneManager можно написать на основе статических методов Composer.
```js
class SceneManager {
    ...
    public middleware() {
        return Composer.branch(
            this.checkSceneInProgressMiddleware,
            Composer.compose([
                this.injectLeaveHookMiddleware,
                this.injectEnterHookMiddleware,
                ...Array.from(this.scenes).map(([key, scene]) => {
                    return Composer.optional(
                        ctx => this.getActiveSceneId(ctx) === key,
                        scene.middleware()
                    );
                }),
            ]),
            this.injectEnterHookMiddleware
        );
    }
}
```
*injectLeaveHookMiddleware & injectEnterHookMiddleware* - встраивают в `ctx.scene` методы `enter: (sceneName: string) => void` и `leave: () => void`. таким образом возможно открывать сцену из других обработчиков.

Scene.ts
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
        //  Тайпинги все еще кривые((
        return ((this.composer as unknown) as any).middleware();
    }
}
```

Использовать можно так:
```js
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
