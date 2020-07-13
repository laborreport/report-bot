# Опыт переписывания верхнеуровневых абстракций при написании бота на базе Telegraf.

Для разработки генератора отчетов был выбран фреймворк `Telegraf`, в котором появились тайпинги для Typescript. Качество их оставляет желать лучшего, что часто случается с библиотеками не написанными изначаотно на typescript.

При очередной доработке бота появилась необходимость в сложных цепочках исполнения, например, для последовательных вопросов пользователю и заполнения данных, без захламления кода условиями. Telegraf имеет для этого `Stage` `Scene`, но тайпинги на него отсутствуют. Поэтому решено переписать его на том функционале Telegraf, который доступен для лучшего понимания процесса композиции.

## Как работает Telegraf

В Telegraf все плагины и обработчики это паттерн Middleware.

```ts
    function(context, next){
        ...some actions
        next();
    }
```

_Класс Telegraf_ - является расширением класса Composer. Отличается настройками доступа к api.telegram.org и прокси.

_Класс Composer_ - класс предоставляющий удобный интерфейс для подписки на события бота:

```ts
bot.hears('sometext', middleware);
bot.command('/start', middleware);
bot.on('document' | 'message' | updateType, middleware);
```

Важно то что все эти подписки можно подключить к главной цепи исполнения через

```ts
bot.use(composer.middleware());
```

как видно цепочки исполнения формируются сразу, далее при исполнении данные пользователя просто прогоняются по готовым цепочкам миддлвар.
А что если нам нужно ветвить цепь исполнения?

У класса есть статические методы которые позволяют комбинировать Middleware как душе угодно.

-   `Composer.compose` - Комбинирует список Middleware в одну.
-   `Composer.optional` - Генерирует Middleware, которая отрабатывает только если `condition === true`

```ts
const OptionalMiddleware = Composer.optional(handler: boolean | ctx => boolean, ctx => ctx.reply('this will work'));
```

-   `Composer.branch` - Генерирует if/else развилку.

```ts
const BranchMiddleware = Composer.branch(
    boolean,
    ctx => ctx.reply('this will work if true'),
    ctx => ctx.reply('this will work if false')
);
const BranchMiddleware = Composer.branch(
    ctx => boolean,
    ctx => ctx.reply('this will work if true'),
    ctx => ctx.reply('this will work if false')
);
```

## Зачем нужны сцены

Для заполнения данных пользователем необходимо держать его в контексте этой "формы" какое-то время, не отвлекаясь на другие обработчики. В моей задаче необходимо было задать пользователю несколько вопросов с валидацией его ответов. Сцена позволяет заблокировать исполнение бота в рамках вопроса до тех пор, пока пользователь не выйдет из сцены (посредством команды `/cancel` например) или не пройдет валидацию вопроса. Каждый вопрос будет отдельной сценой, блокирующей цепочку исполнения для пользователя. Набор вопросов таким образом можно реализовать на основе нескольких сцен открывающихся друг за другом. Для того чтобы разные пользователи могли параллельно заполнять разные формы необходимо где-то хранить состояние каждого из них, а также текущую сцену(или ее отсутствие). Хранить общие данные для миддлвар удобнее всего в сессии.

## Сессия

Для сохранения состояния сцен и прочих данных пользователей применяются сессии.
Внутри сессии можно хранить как идентификатор сцены, так и прочие данные конкретного пользователя.
Сессия это объект в котором хранятся данные по пользователям по их id. Если пользователь новый то под него заводится ключ с его id. миддлвары имеют доступ к ctx.state.session на изменение данных привязанных к пользователю. После отработки последней миддлвары сессия должна зафиксироваться в какой-то внешний объект (бд или память или еще какое-то хранилище).

## Подходим к реализации

Контекст Telegraf расширяем посредством дженериков, таким образом можно добавлять туда свои поля. Также Telegraf рекомендует хранить такие данные в `ctx.state`.
В `ctx.state` мы и положим объект сессии пользователя и методы входа и выхода из сцен.
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

Как видно, структура позволяет вход/выход из сцены посредством `ctx.scene.enter(sceneId)` `ctx.scene.leave()` и получать доступ к сессии через `ctx.state.session`. Идентификатор текущей сцены хранится в `ctx.state.session.scenes.activeSceneId`, в `ctx.state.session.*` данные пользователя, а в `ctx.scene.enter()` и `ctx.scene.leave()` манипуляции входом и выходом из сцен.

Простейший пример реализации сессии приведен ниже:

```ts
class Session {
...
middleware() {
        return async (ctx: TBotContext, next: () => void) => {
            ctx.state.session = this.getOrCreateUserSession(ctx); // Создание или получение существующей сессии для пользователя. Данные для получения ключа берутся из ctx
            await next(); // ждет выполнения всех Middleware после него
            this.commitUserSession(ctx); // и выполняет Commit данных которые изменились в сессии.
        };
    ]
}
```

В примере из репозитория сессии сделаны на основе lowdb с адаптером Memory. Таким образом, данные хранятся в памяти и будут очищены при перезагрузке сервера. Постоянное же хранение данных осуществляется посредством сообщений таким образом, что даже при пустом объекте сессий пользователь всегда может вернуться к сообщению со своими данными и вернуть состоянии сессии до перезагрузки сервера.

## Реализация SceneManager

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

Из кода видно, что когда любая сцена активна то возможен переход в другую сцену и выход из нее, а если никакая сцена не активна, то возможен лишь переход в другую сцену.

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

# Пример использования:
В репозитории можно найти этот пример: `paper/ExampleSetup.ts` и `npm run example`.

```ts
const bot = new Telegraf<TBotContext>(process.env.BOT_TOKEN, {
    telegram: { agent: proxyAgent },
});

const session = new Session({ logging: true });

// Создание сцены
const exampleScene = new Scene('exampleName');
// Сообщение при входе в сцену
exampleScene.enter(ctx =>
    ctx.reply('entering an example scene. /cancel to leave')
);
// Сообщение при выходе из сцены
exampleScene.leave(ctx => ctx.reply('leaving an example scene'));
//  Команда которая работает только внутри сцены
exampleScene.composer.command('/example', ctx =>
    ctx.reply('inside of example scene')
);
// Команда выхода из сцены, которая работает только внутри сцены
exampleScene.composer.command('/cancel', ctx => ctx.scene.leave());
// На любое другое сообщение внутри сцены бот будет отвечать так:
exampleScene.composer.on('message', ctx =>
    ctx.reply(`you're inside a scene. allowed operations /cancel /example`)
);

const sceneManager = new SceneManager([exampleScene]);

bot.use(session.middleware());
bot.use(sceneManager.middleware());

bot.start(ctx => ctx.reply('welcome'));
// вход в сцену по сообщению show me an example scene для примера
bot.hears('show me an example scene', ctx => ctx.scene.enter('exampleName'));

// Старт
bot.launch();
```


Релизация сцен и сессий является хорошим примером реализации сложных ветвлений и может быть полезна в других кейсах, подход к которым будет аналогичен.

Примеры создания цепочки вопросов с валидацией можно найти в репозитории где и представлены все исходники.
Полная документация и прочие примеры использования по данной библиотеке находятся [здесь](https://telegraf.js.org/#/).
