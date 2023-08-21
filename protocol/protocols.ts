// deno-lint-ignore no-explicit-any
type AnyFunction = (...args: any[]) => unknown;

const ProtocolResolver = {
  protocols: [] as Protocol[],
};

interface Protocol<T extends AnyFunction = AnyFunction> {
  (...args: Parameters<T>): ReturnType<T>;
  handler: T;
  isProtocol: true;
  isBound: boolean;
}

const emptyHandler = (() => {
  throw new Error("Handler not set");
}) as unknown;

export function protocol<T extends AnyFunction>(): T {
  const stub = function (
    this: Protocol<T>,
    ...args: Parameters<T>
  ): ReturnType<T> {
    return stub.handler(...args) as ReturnType<T>;
  } as Protocol<T>;
  stub.isProtocol = true;
  stub.isBound = false;
  stub.handler = emptyHandler as T;
  ProtocolResolver.protocols.push(stub);
  return (stub as unknown) as T;
}

type ProtocolModule = Record<string, AnyFunction>;
type Identity<T> = T;
type Flatten<T extends object> = Identity<{ [k in keyof T]: T[k] }>;

type BindRules<T extends ProtocolModule> = {
  protocol: () => Promise<T> | T;
  to: () => Promise<Flatten<T>> | Flatten<T>;
};

export async function bind<T extends ProtocolModule>(rules: BindRules<T>) {
  const Protocols = await rules.protocol();
  const concrete = await rules.to();
  for (const ProtocolName in Protocols) {
    const Protocol = (Protocols[ProtocolName] as unknown) as Protocol;
    if (Protocol.isProtocol) {
      Protocol.handler = concrete[ProtocolName];
      Protocol.isBound = true;
    }
  }
}

export function resetAllProtocols<T extends ProtocolModule>() {
  for (const Protocol of ProtocolResolver.protocols) {
    Protocol.handler = emptyHandler as typeof Protocol;
    Protocol.isBound = false;
  }
}

export function assertProtocolsAreBound() {
  for (const Protocol of ProtocolResolver.protocols) {
    if (!Protocol.isBound) {
      throw new Error("An imported Protocol is not bound");
    }
  }
}
