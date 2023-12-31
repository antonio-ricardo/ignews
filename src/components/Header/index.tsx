import { SignInButton } from '../SignInButton'
import styles from './styles.module.scss'

export function Header() {
    return (
        <header className={styles.headerContainer}>
            <div className={styles.headerContent}>

                <img src="/logo.svg" alt="" />

                <nav>
                    <a className={styles.active} href="./">Home</a>
                    <a href="./">Posts</a>
                </nav>


                <SignInButton />
            </div>
        </header>
    )
}