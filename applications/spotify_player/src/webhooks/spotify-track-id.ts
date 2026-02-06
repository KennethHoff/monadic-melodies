export const hook = async (req: Request): Promise<Response> => {

        if (!req.body) {
                return new Response("No body");
        }

        const json = await req.body.json();

        return new Response(json);
};
