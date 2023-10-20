//quand la fen a fini de charger
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM is loaded');

    //on get le fichier ../keywords.json
    fetch('/data')
        .then(res => res.json())
        .then(data => {
            console.log(data);
            //on affiche les catégories
            for(let categoryName in data){
                showCategory(categoryName, data[categoryName]);
            }
            
        })
        .catch(err => console.error(err));
});

function showCategory(categoryName,categoryData){
    //on ajoute le nom
    let category = document.createElement('div');
    category.classList.add('category');
    let categoryNameElement = document.createElement('h2');
    categoryNameElement.textContent = categoryName;
    category.appendChild(categoryNameElement);
    //on ajoute les mots clés
    let keywords = document.createElement('div');
    keywords.classList.add('keywords');
    for(let keywordName in categoryData.reply){
        let content = showKeyword(categoryData.reply[keywordName]);
        keywords.appendChild(content);
    }
    category.appendChild(keywords);
    document.body.appendChild(category);
}

function showKeyword(keywordName){
    let keyword = document.createElement('div');
    keyword.classList.add('keyword');

    let keywordContent = document.createElement('div');
    keywordContent.classList.add('keyword-content');

    //name
    let keywordNameElement = document.createElement('h3');
    keywordNameElement.classList.add('keyword-name');
    keywordNameElement.textContent = keywordName.message;
    keywordContent.appendChild(keywordNameElement);

    //weight
    let keywordWeightElement = document.createElement('p');
    keywordWeightElement.classList.add('keyword-weight');
    keywordWeightElement.textContent = keywordName.weight;
    keywordContent.appendChild(keywordWeightElement);

    keyword.appendChild(keywordContent);

    return keyword;
}

//fonctions relative a l'ajout et la modification de mots clés