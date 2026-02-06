export const hook = async (req: Request): Promise<Response> => {
        const trackUri = req.headers.get('track-uri');
        if (!trackUri) {
                console.log("No track uri");
                return new Response("No track uri");
        }

        console.log("Track uri", trackUri);
        return new Response(trackUri);
};
