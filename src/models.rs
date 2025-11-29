use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct CoinGeckoResponse {
    pub id: String,
    pub symbol: String,
    pub name: String,
    pub current_price: f64,
    pub price_change_percentage_24h: Option<f64>,
    pub high_24h: Option<f64>,
    pub low_24h: Option<f64>,
    pub market_cap: Option<f64>,
}

#[derive(Debug, Serialize)]
pub struct DashboardData {
    pub timestamp: String,
    pub market_status: String,
    pub coins: Vec<CoinGeckoResponse>,
}