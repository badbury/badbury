import * as NodeJSHttp from 'http';
import { http, HttpModule, StartHttpServer } from '@badbury/http-server/src/module';
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
  FunctionCallable,
} from '@badbury/ioc';
import { GetUsers } from '@badbury/http-server/examples/use-case-with-types/get-users';
import { GetUsersHttpRoute } from '@badbury/http-server/examples/use-case-with-types/get-users-http';
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
//     - interceptors bind(X).intercept('foo', Y, Z).to(A)
//     - decorators bind(X).decorate(Y, Z).to(A)
//     - pipeline bind(X).method('baz', (m) => m.pipe(Y, 'foo').pipe(Z, 'bar')).to(A) (use Proxy)
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
//   - Throw on missing definition
//   - Detect missing dependencies in a module definition type
//     - only allow a complete module to be passed to containers
//   - Better primitives for functional style
//     - partial binding bind(MyFunction).to(myFunction).partial(2, Printer)
//     - reader style application where the subject function returns a function
//       that takes the dependencies
//   - Resolution scopes: non singleton scoped and request scoped
//   - Aggregate multiple dependencies of the same type
//   - Resolve all bindings at application start
//   - Module scoping
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
// Decorator - decorate
// Extension - ???
// Facade - ???
// Front controller - http/command/every
// Module - Module
// Proxy	- ???
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

export class MyModule {
  register(): Definition[] {
    return [
      config(MyConfig),
      // bind(MyConfig).value({ url: 'https://localhost:8080' }), // e.g. for testing
      bind(Bar),
      bind(MyModule),
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
      bind(Trigger)
        .method('trigger', (method) =>
          method
            .before((val) => {
              console.log('About to trigger', val);
              return val;
            })
            .intercept((val, next) => {
              const time = Date.now();
              console.log('Measuring the duration of Trigger.trigger...');
              const val2 = next(val);
              console.log('Duration of Trigger.trigger was ', Date.now() - time);
              return val2;
            })
            .after(() => {
              console.log('Triggered Trigger.trigger');
            }),
        )
        .with(DynamicEventSink, DynamicEventSink),
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
      on(Baz).use(Foo, Bar).do(MyModule, 'handleBaz'),
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
      on(Shutdown).do(async (shutdown) => {
        console.log('Prepping shutdown', shutdown);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log('Finishing shutdown');
        return 'Foooo';
      }),
      every('second')
        .and(100, 'milliseconds')
        .limit(5)
        .use(SendHttpRequest)
        .do(async function* (sendHttpRequest) {
          yield sendHttpRequest('http://localhost:8080/users?limit=1');
          yield sendHttpRequest('http://localhost:8080/companies?limit=1');
        })
        .emit(),
      on(HttpResponse).do(({ body }) => {
        console.log('Http response', body);
      }),
      every(10, 'seconds')
        .limit(1)
        .do(() => new Shutdown(0, '10 seconds up'))
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
  new HttpModule(),
  new TimerModule(),
  new ConfigModule(),
  new NodeJSLifecycleModule(),
  new MyModule(),
]);

console.log(c.get(Bar));
const foo = c.get(Foo);
const foo99 = c.get(Foo99);
console.log(foo99);
console.log(foo);
c.emit(foo99);

c.emit(new Tig());

const tigHandler = c.get(TigHandler);
tigHandler(new Tig());

c.emit(new StartHttpServer(8080));

function subject(s: string) {
  console.log(`Subject is ${s}`);
  return s + s;
}
function addOne(s: string) {
  return s + 1;
}
// const S = callable(subject);
// const S = (callable(subject) as unknown) as Callable<[string], [], string>; //
// const B = S.before;
// const B = S.intercept((str, next) => {
//   str += '1234';
//   const k = next(str);
//   return k + '5678';
// });
// console.log(B.call(['Yes'], c, c));

const ff = new FunctionCallable<[string], [], [string]>([], (a: string) => [a], false);

const f = ff
  .before((a) => a + ' hooo')
  .after((a) => [...a, ...a])
  .intercept((a, next) => {
    console.log('Before', a);
    const r = next(a);
    console.log('After', r);
    return r;
  })
  .compile(c, c);

console.log(f('Booo'));

// bind(Bar)
//   .to(Bar)
//   .before((a) => '11')
//   .before((a) => 22)
//   // .intercept((a) => 22)
//   .after((a) => 22)
//   .before((a) => 22)
//   .before((a) => 22);

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
