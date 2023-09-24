import { protocol } from "./protocols.ts";

export const doThing = protocol<(one: string, two: number) => string>();

// export const healthcheck = route("GET /healthcheck", {
//   request: {
//     path: {
//       programId: String,
//     },
//     query: {
//       name: String,
//     },
//   },
//   response: {
//     200: {
//       body: {
//         data: [{ name: String }],
//       },
//     },
//   },
//   handle() {
//   },
// });

// function request(_a) {}
// function response(_a) {}
// function security(_a) {}

// export class Healthcheck implements Route {
//   route = "GET /healthcheck";

//   middleware = [
//     request({
//       path: {
//         programId: String,
//       },
//       query: {
//         name: String,
//       },
//     }),
//     response({
//       200: {
//         body: {
//           data: [{ name: String }],
//         },
//       },
//     }),
//     security,
//   ];

//   handle() {
//   }
// }
