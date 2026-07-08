export const getTopHeadlines = async (req, res) => {
    try {
        const { category, country = 'us' } = req.query;
        let url = `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${process.env.NEWS_API_KEY}`;
        
        if (category && category !== 'all') {
            url += `&category=${category}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        
        return res.status(response.status).json(data);
    } catch (error) {
        console.error("Error fetching top headlines:", error);
        return res.status(500).json({ status: "error", message: "Failed to fetch top headlines" });
    }
};

export const searchNews = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ status: "error", message: "Search query is required" });
        }
        
        let url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&apiKey=${process.env.NEWS_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();
        
        return res.status(response.status).json(data);
    } catch (error) {
        console.error("Error searching news:", error);
        return res.status(500).json({ status: "error", message: "Failed to search news" });
    }
};
