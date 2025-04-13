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
      <div className={styles.header}>
        <div className={styles.left}>
          <div className={styles.ratingValue}>4.7</div>
          <div className={styles.starContainer}>
            <div className={styles.starRow}>
              {renderStars(4)} 
            </div>
            <div className={styles.totalReviews}>12 avaliações</div>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.distributionRow}>
            <div className={styles.barContainer}>
              <div className={styles.barFill} style={{ width: '80%' }}></div>
            </div>
            <span>5★</span>            
          </div>
          <div className={styles.distributionRow}>            
            <div className={styles.barContainer}>
              <div className={styles.barFill} style={{ width: '60%' }}></div>
            </div>
            <span>4★</span>
          </div>
          <div className={styles.distributionRow}>
            <div className={styles.barContainer}>
              <div className={styles.barFill} style={{ width: '30%' }}></div>
            </div>
            <span>3★</span>
          </div>
          <div className={styles.distributionRow}>
            <div className={styles.barContainer}>
              <div className={styles.barFill} style={{ width: '10%' }}></div>
            </div>
            <span>2★</span>
          </div>
          <div className={styles.distributionRow}>
            <div className={styles.barContainer}>
              <div className={styles.barFill} style={{ width: '5%' }}></div>
            </div>
            <span>1★</span>
          </div>
        </div>
      </div>
  );
}
