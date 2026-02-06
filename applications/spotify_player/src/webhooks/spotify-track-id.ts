export const hook = async (req: Request): Promise<Response> => {

        if (!req.body) {
                console.log("No body");
                return new Response("No body");
        }

        const json = await req.body.json();
        
        console.log(json);
        return new Response(json);
};
