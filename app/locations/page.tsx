import Header from "@/components/Header";
import Nav from "@/components/Nav";

export default function LocationsPage() {
    return (
        <>
            <Nav />
            <Header />
            <div
                dangerouslySetInnerHTML={{
                    __html: `
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <title>Locations</title>
                        </head>
                        <body>
                            <div style="width: 100%; height: calc(100vh - 64px);">
                                <iframe 
                                    src="/localities_and_listings.html"
                                    style="width: 100%; height: 100%; border: none;"
                                />
                            </div>
                        </body>
                    </html>
                    `
                }}
            />
        </>
    );
}
