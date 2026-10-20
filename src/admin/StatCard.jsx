function StatCard({ stat, loading }) {
    return (
        <article className="admin-stat-card" key={stat.label}>
            <div className="admin-stat-top">
                <span>{stat.label}</span>
                <div className={`admin-stat-icon ${stat.color}`}>{stat.icon}</div>
            </div>

            <div className="admin-stat-value">
                {loading ? (
                    <span className="admin-loading">불러오는 중...</span>
                ) : (
                    stat.value
                )}
            </div>

            <div className="admin-stat-description">
                <span className="stat-dot" />
                {stat.description}
            </div>
        </article>
    );
}

export default StatCard;
