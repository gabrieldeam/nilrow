import styles from './Product.module.css';
import starYellowIcon from '../../../../public/assets/starYellow.svg';
import starIcon from '../../../../public/assets/star.svg';

export default function ProductRating() {
  // Quantidade total de estrelas
  const totalStars = 5;

  // Função para renderizar estrelas cheias ou vazias
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= totalStars; i++) {
      const starSrc = i <= rating ? starYellowIcon.src : starIcon.src;
      stars.push(
        <img
          key={i}
          src={starSrc}
          alt="star"
          className={styles.starIcon}
        />
      );
    }
    return stars;
  };

  return (
    <div className={styles.productRatingContainer}>
      {/* Cabeçalho: nota geral + distribuição de estrelas */}
      <div className={styles.header}>
        {/* Parte esquerda: nota, estrelas e total de avaliações */}
        <div className={styles.left}>
          <div className={styles.ratingValue}>4.7</div>
          <div className={styles.starRow}>
            {renderStars(4)} {/* Exibe 4 estrelas cheias (exemplo simplificado para 4.7) */}
          </div>
          <div className={styles.totalReviews}>12 avaliações</div>
        </div>

        {/* Parte direita: distribuição por estrela (5★, 4★, etc.) */}
        <div className={styles.right}>
          <div className={styles.distributionRow}>
            <span>5★</span>
            <div className={styles.barContainer}>
              {/* Ajuste a width conforme a % de avaliações que deram 5 estrelas */}
              <div className={styles.barFill} style={{ width: '80%' }}></div>
            </div>
          </div>
          <div className={styles.distributionRow}>
            <span>4★</span>
            <div className={styles.barContainer}>
              <div className={styles.barFill} style={{ width: '60%' }}></div>
            </div>
          </div>
          <div className={styles.distributionRow}>
            <span>3★</span>
            <div className={styles.barContainer}>
              <div className={styles.barFill} style={{ width: '30%' }}></div>
            </div>
          </div>
          <div className={styles.distributionRow}>
            <span>2★</span>
            <div className={styles.barContainer}>
              <div className={styles.barFill} style={{ width: '10%' }}></div>
            </div>
          </div>
          <div className={styles.distributionRow}>
            <span>1★</span>
            <div className={styles.barContainer}>
              <div className={styles.barFill} style={{ width: '5%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Avaliações separadas por critério */}
      <div className={styles.subRatings}>
        <div className={styles.subRatingItem}>
          <div className={styles.starRow}>{renderStars(5)}</div>
          <span className={styles.subRatingLabel}>Custo-benefício</span>
        </div>
        <div className={styles.subRatingItem}>
          <div className={styles.starRow}>{renderStars(4)}</div>
          <span className={styles.subRatingLabel}>Resistência</span>
        </div>
        <div className={styles.subRatingItem}>
          <div className={styles.starRow}>{renderStars(3)}</div>
          <span className={styles.subRatingLabel}>Potência</span>
        </div>
        <div className={styles.subRatingItem}>
          <div className={styles.starRow}>{renderStars(3)}</div>
          <span className={styles.subRatingLabel}>Duração da bateria</span>
        </div>
      </div>
    </div>
  );
}
