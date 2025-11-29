mod fetcher;
mod models;

use actix_files as fs;
use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use fetcher::CryptoFetcher;
use std::io;
use env_logger::{Builder, Env};

async fn get_crypto_data() -> impl Responder {
    match CryptoFetcher::fetch_top_coins().await {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(_) => HttpResponse::InternalServerError().json("Failed to fetch data"),
    }
}

#[actix_web::main]
async fn main() -> io::Result<()> {
    Builder::from_env(Env::default().default_filter_or("info")).init();

    println!("Started [http://127.0.0.1:8080]");

    HttpServer::new(|| {
        App::new()
            .route("/api/data", web::get().to(get_crypto_data))
            .service(fs::Files::new("/", "./static").index_file("index.html"))
    })
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}