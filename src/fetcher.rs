use crate::models::{CoinGeckoResponse, DashboardData};
use chrono::Local;
use reqwest::Error;

pub struct CryptoFetcher;

impl CryptoFetcher {
    pub async fn fetch_top_coins() -> Result<DashboardData, Error> {
        let url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false";

        let client = reqwest::Client::new();
        let response = client
            .get(url)
            .header("User-Agent", "CryptoDashboard/1.0")
            .send()
            .await?;

        let coins: Vec<CoinGeckoResponse> = response.json().await?;

        let btc_change = coins.first().and_then(|c| c.price_change_percentage_24h).unwrap_or(0.0);
        let market_status = if btc_change >= 0.0 {
            "BULLISH".to_string()
        } else {
            "BEARISH".to_string()
        };

        Ok(DashboardData {
            timestamp: Local::now().format("%H:%M:%S").to_string(),
            market_status,
            coins,
        })
    }
}   