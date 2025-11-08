export function checkIfLogedIn(){
    const authToken = localStorage.getItem('authToken');

    if (authToken) {
        // TOKEN JE PRONAĐEN (Korisnik je prijavljen)
        console.log('Korisnik je prijavljen.');
        // (npr. 'Welcome Dashboard')
        //document.getElementById('app-container').innerHTML = '<h2>Dobrodošli! Vi ste prijavljeni.</h2>';
        return true;
    } else {
        // TOKEN NIJE PRONAĐEN (Korisnik nije prijavljen)
        console.log('Korisnik nije prijavljen.');
        // (npr. login/register forme)
        //document.getElementById('app-container').innerHTML = '<h2>Molimo prijavite se.</h2>';
        return false;
        }
    }