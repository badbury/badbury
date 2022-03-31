import * as NodeJSHttp from 'http';
import {
  http,
  HttpModule,
  StartHttpServer,
  HttpServerStarted,
  HttpServerStopped,
} from '@badbury/http-server/src/module';
import { every, TimerModule } from '@badbury/timers/src/module';
import { config, ConfigModule } from '@badbury/config/src/module';
import { GetCompanies } from '@badbury/http-server/examples/simple-use-case/get-companies';
import { GetCompaniesHttpRoute } from '@badbury/http-server/examples/simple-use-case/get-companies-http';
import {
  Container,
  bind,
  lookup,
  on,
  value,
  DynamicEventSink,
  NodeJSLifecycleModule,
  Definition,
  Shutdown,
  LoggerModule,
  LogInfo,
  Startup,
  Ready,
  Exit,
} from '@badbury/ioc';
import { GetUsers } from '@badbury/http-server/examples/use-case-with-types/get-users';
import { GetUsersHttpRoute } from '@badbury/http-server/examples/use-case-with-types/get-users-http';
import { HttpServerConfig } from '@badbury/http-server';
// @TODO:
// - Implement the following features:
//   - Core
//     - di bind(X).to(Y).with(A, B) DONE
//     - events on(Foo).do(X, 'foo') DONE
//   - Adapters
//     - http routing http(GetFoo).do(X, 'foo') DONE
//     - cli routing command(ServeHttp).do(X, 'foo')
//     - timers every(5, 'minutes').use(Y).do(X, 'foo') DONE
//   - Composers
//     - interceptors bind(X).intercept('myMethod', Y, 'foo').to(A) DONE
//     - decorators bind(X).decorate(Y, Z).to(A)
//     - pipeline bind(X).before('myMethod', Y, 'foo').before('myMethod', Z, 'bar').to(A) DONE
//     - factories bind(X).use(Foo).factory((foo) => foo.getX()) DONE
//       - factories handle methods: factory(Foo, 'getX') DONE
//     - dispatchers on(X).dispatchWith(Y, 'foo') DONE
//     - use extra args on(Foo).use(Y).do(X, 'foo') DONE
//     - emit on(X).do(Y, 'foo').emit() DONE
// - Di = bind | Events = on | Http = http | Cli = command | Timer = every
// Misc todo:
// - IOC
//   - Detect incomplete bindings e.g. bind(Foo) should fail if Foo requires params DONE
//   - Implement recursive loop checks
//   - Throw on missing definition DONE
//   - Detect missing dependencies in a module definition type
//     - only allow a complete module to be passed to containers
//   - Better primitives for functional style
//     - partial binding bind(MyFunction).to(myFunction).partial(2, Printer)
//     - reader style application where the subject function returns a function
//       that takes the dependencies
//   - Resolution scopes: non singleton scoped and request scoped
//   - Aggregate multiple dependencies of the same type:
//     - class Tokens extends Array<number> {}
//     - bind(Tokens).add(BraceToken)
//     - bind(BraceToken).tag(Tokens)
//   - Resolve all bindings at application start
//   - Module scoping
//   - bind modifiers for regular functions
//   - Add metadata to callable modifiers (method name, class, instance)
//   - Modifier container args bind(X).intercept('myMethod', [Foo] as const, (val, foo) => foo.process(val));
// - Config
//   - Better/safer schemaless config parsing
//     - Only allow schemaless config objects when all values are strings, or...
//     - Use default values to do smart casting number/boolean
// - Road to V1:
//   - Jest all the things
//   - Consistent module structure
//   - Documentation
//   - Examples
//   - README
//     - Tagline
//     - Summary
//     - Installation
//     - Documentation
//     - Examples
//   - Logos, branding and website

// Creational patterns
// Builder	- use a factory
// Dependency Injection - bind/with
// Factory method - factoryBuilder - Given a resolvable and a method name, build a factory object
// Lazy initialization	- lazy - wrap type in proxy and only initalize when called
// Multiton - bind with extended classes
// Singleton	- bind creates a singleton

// Structural patterns
// Decorator - intercept
// Extension - ???
// Facade - ???
// Front controller - http/command/every
// Module - Module
// Proxy	- intercept
// Chain of responsibility	- pipeline & pipe bind(X).pipe(Y, 'method').pipe(Z, 'other')
// Command - on/use/do
// Observer - on/do

class MyConfig {
  url = 'https://example.org';
}

class Bar {
  constructor(public one = Math.random()) {}
}

class Foo {
  constructor(public bar: Bar, private url: string, private id: number) {}
  getBar(): Bar {
    return this.bar;
  }
  makeBaz(): Baz {
    return new Baz(this.url);
  }
}

abstract class Foo66 extends Foo {}
abstract class Foo77 extends Foo {}
abstract class Foo88 extends Foo {}
abstract class Foo99 extends Foo {}

class Baz {
  constructor(public name: string) {}
}

class Box {
  badMethod(str: string) {
    console.log(str);
  }
  process(baz: Baz) {
    console.log('Box class processing........', baz);
  }
}

type TriggerEvents = Bar | Baz;
interface TriggerEventClassEmitter {
  dispatch(event: TriggerEvents): void;
}
type TriggerEventFunctionEmitter = (event: TriggerEvents) => void;

class Trigger {
  constructor(
    private emitter: TriggerEventClassEmitter,
    private emit: TriggerEventFunctionEmitter,
  ) {}

  trigger(foo: Foo) {
    this.emitter.dispatch(foo.getBar());
    this.emit(foo.makeBaz());
  }
}

class Tig {
  makeTog() {
    return new Tog();
  }
}
class Tog {}

abstract class ConfigUrl extends String {}

// type ExampleFnType = (tig: Tig) => void;
interface TigHandler {
  (tig: Tig): void;
}
abstract class TigHandler {}
interface SendHttpRequest {
  (url: string | URL): Promise<HttpResponse>;
}
abstract class SendHttpRequest {}
class HttpResponse {
  constructor(public body: string) {}
}

class MethodModifyerTest {
  public doTheThing(name: string) {
    console.log(name);
    return {
      type: 'Person',
      name,
    };
  }
}

// type Provider<T> =
//   | { provide: T; fromBundle: Bundle }
//   | { provide: T; useFactory: () => Promise<T> | T; inject: unknown[] }
//   | { provide: T; useClass: new (...args: any[]) => T }
//   | { provide: T; useValue: T };

// type BundleOptions = { autoStart?: boolean; offer?: Provider<unknown>[] };

// abstract class Bundle {
//   public readonly autoStart: boolean = true;
//   public readonly exposeAll: boolean = false;
//   public readonly useAllOffers: boolean = true;
//   protected readonly container: Container;

//   constructor(options: BundleOptions = {}, parent: Container = new Container([])) {
//     this.container = parent.registerBundle({
//       autoStart: this.autoStart,
//       exposeAll: this.exposeAll,
//       useAllOffers: this.useAllOffers,
//       ...options,
//       class: this.constructor,
//       definitions: this.register(),
//     });
//   }

//   abstract register(): Definition[];
// }

// class MyBundle extends Bundle {
//   register(): Definition[] {
//     return [bind(Tig).require()];
//   }

//   getTog(): Tog {
//     return this.container.get(Tig).makeTog();
//   }
// }

// const moduleOne = new MyBundle({ offer: [{ provide: Tig, fromBundle: FooModule }] });
// moduleOne.getTog();

// export class App extends Bundle {

export class MyModule {
  register(): Definition[] {
    return [
      config(MyConfig),
      // bind(MyConfig).value({ url: 'https://localhost:8080' }), // e.g. for testing
      bind(Bar),
      bind(MyModule),
      // // Requires
      // bind(Bar).required(),
      // // Includes
      // include(BarBundle).offer(Foo66, Foo).exposeAll().offerAll(),
      // bind(Bar).from(BarBundle),
      // bind(Foo66).from(BarBundle, Foo).expose(),
      // // Expose
      // bind(Foo).expose(),
      bind(ConfigUrl)
        .use(MyConfig)
        .factory((config) => config.url),
      bind(Foo66).to(Foo).with(Bar, ConfigUrl, value(66)),
      bind(Foo99)
        .to(Foo)
        .with(
          Bar,
          lookup(MyConfig).map((config) => config.url),
          value(99),
        ),
      bind(Foo77).factory(() => new Foo(new Bar(0.7), 'Nooo', 77)),
      bind(Foo88)
        .use(Bar, MyConfig)
        .factory((bar, config) => new Foo(bar, config.url, 88)),
      bind(Foo).with(Bar, lookup(MyConfig).map(this.getUrl), value(1)),
      bind(Box),
      bind(Trigger).with(DynamicEventSink, DynamicEventSink),
      bind(MethodModifyerTest)
        .before('doTheThing', (param) => {
          return 'Dr ' + param;
        })
        .teeBefore('doTheThing', (param) => console.log('About to trigger', param))
        .intercept('doTheThing', (param, next) => {
          param = param.split('').reverse().join('').toLowerCase();
          param = param[0].toUpperCase() + param.slice(1);
          const result = next(param);
          result.name += ' Rogers';
          return result;
        })
        .teeIntercept('doTheThing', (_, next) => {
          const time = Date.now();
          next();
          console.log('Duration of MethodModifyerTest.doTheThing was ', Date.now() - time);
        })
        .after('doTheThing', (result) => {
          result.type = 'Robot';
          result.name += ' - Man of mystery';
          return result;
        })
        .teeAfter('doTheThing', (result) => console.log(result)),
      bind(TigHandler).value((tig) => console.log('MY TIG MADE THE TOG', tig.makeTog())),
      bind(SendHttpRequest).value(
        (url) =>
          new Promise((resolve) => {
            const req = NodeJSHttp.request(url, (res) => {
              res.on('data', (d) => {
                resolve(new HttpResponse(d.toString('utf8')));
              });
            });
            req.end();
          }),
      ),
      on(Foo).do(Trigger, 'trigger'),
      on(Bar).do((bar) => console.log('Arrow Bar...', bar)),
      on(Baz).do(Box, 'process'),
      on(Baz).use(Foo88, Bar).do(this.handleBaz),
      on(Baz)
        .use(Foo88)
        .do((baz, foo) => console.log('Arrow Baz...', baz, foo.getBar())),
      on(Tig)
        .do((tig) => tig.makeTog())
        .emit(),
      on(Tog).do((tog) => console.log('I got the tog!', tog)),
      on(Tig).do(TigHandler),
      bind(GetCompanies),
      bind(GetCompaniesHttpRoute),
      http(GetCompaniesHttpRoute)
        .use(GetCompanies)
        .do((req, getCompanies) => getCompanies.handle(req)),
      bind(GetUsers),
      bind(GetUsersHttpRoute),
      http(GetUsersHttpRoute).do(GetUsers, 'handle'),
      on(Shutdown).do(async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }),
      bind(HttpServerConfig).value({ port: 8080 }),
      every('second')
        .and(100, 'milliseconds')
        .use(SendHttpRequest)
        .do(async function* (sendHttpRequest) {
          yield sendHttpRequest('http://localhost:8080/users?limit=1');
          yield sendHttpRequest('http://localhost:8080/companies?limit=1');
        })
        .emit(),
      on(HttpResponse).do(LogInfo),
      on(Startup).do(LogInfo),
      on(Ready).do(LogInfo),
      on(HttpServerStarted).do(LogInfo),
      on(HttpServerStopped).do(LogInfo),
      on(Shutdown).do(LogInfo),
      on(Exit).do(LogInfo),
      every(10, 'seconds')
        .limit(1)
        .do(() => new Shutdown('10 seconds up', 0))
        .emit(),
    ];
  }

  getUrl(config: MyConfig): string {
    return config.url;
  }

  handleBaz(baz: Baz, foo: Foo, bar: Bar): void {
    console.log('Use statement', baz, foo, bar);
  }
}

const c = new Container([
  new LoggerModule(),
  new HttpModule(),
  new TimerModule(),
  new ConfigModule(),
  new NodeJSLifecycleModule(),
  new MyModule(),
]);

c.startup();

console.log(c.get(Bar));
const foo = c.get(Foo);
const foo99 = c.get(Foo99);
console.log(foo99);
console.log(foo);
c.emit(foo99);

c.emit(new Tig());

const tigHandler = c.get(TigHandler);
tigHandler(new Tig());

c.emit(new StartHttpServer());

const methodModifyerTest = c.get(MethodModifyerTest);
const methodModifyerTestResult = methodModifyerTest.doTheThing('Dave');
console.log(methodModifyerTestResult);

// MODULES START

// class Infrastructure extends Bundle {
//   register() {
//     return [
//       include(LoggerModule).exportAll(),
//       include(HttpModule).exportAll(),
//       include(TimerModule).exportAll(),
//       include(ConfigModule).exportAll(),
//       include(NodeJSLifecycleModule).exportAll(),
//     ];
//   }
// }

// class Bootstrap extends Bundle {
//   register() {
//     return [
//       include(Infrastructure),
//       include(App).offerFrom(Infrastructure),
//       on(Ready)
//         .use(Bar, Foo, Foo99, TigHandler, MethodModifyerTest)
//         .do(async function* (_, bar, foo, foo99, tigHandler, methodModifyerTest) {
//           console.log(bar);
//           console.log(foo99);
//           console.log(foo);
//           yield foo99;

//           yield new Tig();

//           tigHandler(new Tig());

//           yield new StartHttpServer();

//           const methodModifyerTestResult = methodModifyerTest.doTheThing('Dave');
//           console.log(methodModifyerTestResult);
//         })
//         .emit(),
//     ];
//   }
// }

// if (require.main) {
//   new Bootstrap().startup();
// }

// MODULES END

// type TypeParams<T extends ClassLike<T>, K> = T extends new (...args: infer ClassParams) => unknown
//   ? AsConstructors<ClassParams>
//   : T extends new (...args: infer FnParams) => unknown
//   ? K extends new (...args: infer TypeParams) => unknown
//     ? AsConstructors<[...TypeParams, ...FnParams]>
//     : never
//   : never;

// Vision 28th May
// class UserModule {
//   define() {
//     return [
//       config(KeycloakConnection).schema({
//         url: define(),
//       }),
//       config(ConcurrencyLimit),
//       bind(GetUsers).with(KeycloakConnection),
//       bind(SlackNotify).to(Slack, 'notify'),
//       command('get-users', GetUsersCommand).do(GetUsers),
//       http('GET', '/users', GetUsersHttp).do(GetUsers),
//       every(7, 'seconds').do(FlushUsers),
//       on(UserCreated).do(SlackNotify),
//     ];
//   }
// }

// vs

// class UserModule {
//   define() {
//     return [
//       config(KeycloakConnection).object(KeycloakConnectionDefinition),
//       config(ConcurrencyLimit),
//       bind(GetUsers).with(KeycloakConnection),
//       bind(SlackNotify).to(Slack, 'notify'),
//       command(GetUsersCommand).do(GetUsers),
//       http(GetUsersHttp).do(GetUsers),
//       every(SevenSeconds).do(FlushUsers),
//       on(UserCreated).do(SlackNotify),
//     ];
//   }
// }

// Vision 31st Oct
// Refine and make simple:
// - http controllers should be more regular so no .do mapping
// - config should be infered as much as possible but still be type safe

// Idea 8 Nov

// class UserModule {
//   define() {
//     return [
//       http('GET', '/foo')
//         .body(MyBodySchema)
//         .headers(MyHeadersSchema)
//         .query(MyQuerySchema)
//         .handle(MyHandler, 'handle')
//         .response(200, HappyResponseSchema)
//         .response(404, SadResponseSchema)
//     ];
//   }
// }
