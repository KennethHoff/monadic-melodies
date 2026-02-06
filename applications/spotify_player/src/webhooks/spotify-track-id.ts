export const hook = async (req: Request): Promise<Response> => {
        if (!req.body) {
                console.log("No body");
                return new Response("No body");
        }

        const json = await req.body.json();
        const data = json['data'];
        const trackUri = data['track-uri'];
        if (!trackUri) {
                console.log("No track uri");
                return new Response("No track uri");
        }

        console.log("Got this uri", trackUri);
        return new Response(trackUri);
};
