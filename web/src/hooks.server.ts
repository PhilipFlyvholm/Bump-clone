import type { RequestEvent } from '@sveltejs/kit';
import { InngestCommHandler, type ServeHandler } from 'inngest/components/InngestCommHandler';
import { queryKeys } from 'inngest/helpers/consts';
import { allProcessEnv } from 'inngest/helpers/env';
import { building, dev } from '$app/environment';
import testFunction from './inngest/bumpFunction';
const serve: ServeHandler = (nameOrInngest, fns, opts) => {
	const handler = new InngestCommHandler(
		'sveltekit',
		nameOrInngest,
		fns,
		opts,
		({
			event,
			resolve
		}: {
			event: RequestEvent;
			resolve: (event: RequestEvent) => Promise<Response>;
		}) => {
			const env = allProcessEnv();
			const request = event.request;

			const url = new URL(
				event.url.href as string,
				`${event.url.protocol}//${event.url.host || ''}/`
			);

			const isProduction =
				env.VERCEL_ENV === 'production' ||
				env.CONTEXT === 'production' ||
				env.ENVIRONMENT === 'production' ||
				building ||
				!dev;

			return {
				register: () => {
					if (request.method === 'PUT') {
						const returnData = {
							env,
							url,
							isProduction,
							deployId: url.searchParams.get(queryKeys.DeployId)?.toString()
						};

						return returnData;
					}
				},
				run: async () => {
					if (request.method === 'POST') {
						const returnData = {
							data: (await request.json()) as Record<string, any>,
							fnId: url.searchParams.get(queryKeys.FnId) as string,
							env,
							isProduction,
							url
						};
						return returnData;
					}
				},
				view: () => {
					if (request.method === 'GET') {
						return {
							env,
							isIntrospection: url.searchParams.has(queryKeys.Introspect),
							url,
							isProduction
						};
					}
				}
			};
		},
		async (
			actionRes,
			{
				event,
				resolve
			}: { event: RequestEvent; resolve: (event: RequestEvent) => Promise<Response> }
		) => {
			//set response stauts on new response object
			const response: Response = new Response(actionRes.body, { status: actionRes.status });
			for (const [key, value] of Object.entries(actionRes.headers)) {
				response.headers.set(key, value);
			}
			return response;
		}
	);
	const handlerObj = handler.createHandler();
		
	return handlerObj;
};

const inngestHandler = await serve('My app', [testFunction], {});

export async function handle({
	event,
	resolve
}: {
	event: RequestEvent;
	resolve: (event: RequestEvent) => Promise<Response>;
}) {
	if (event.url.pathname.startsWith('/api/inngest')) return inngestHandler({event, resolve});
	return await resolve(event);
}
