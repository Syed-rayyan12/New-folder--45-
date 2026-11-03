'use client'

import { LockKeyhole } from 'lucide-react'
import styles from './workspace-pages.module.css'

export function CollectionPage() {
  return <div className={`${styles.page} ${styles.collectionPage}`}><header className={styles.pageHead}><div><h1>COLLECTION</h1><p>Locked · Future Phase.</p></div><LockKeyhole size={15}/></header><section className={styles.collectionLocked} aria-label="Collection locked"><div className={styles.lockCircle}><LockKeyhole size={29} strokeWidth={1.4}/></div><span>FUTURE PHASE</span><h2>THE COLLECTION</h2><p>Your Products. Your Archive. Your Next Chapter.</p><p>The Collection Management System Is Currently Locked. Product Management And<br/>Commerce Tools Will Become Available In A Future Phase.</p></section></div>
}
