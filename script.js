// デモ用の馬データ（8頭）
const horses = [
    { number: 1, name: "サクラインパクト", jockey: "櫻井祐弥" },
    { number: 2, name: "オカケンボンド", jockey: "岡本健嗣" },
    { number: 3, name: "ナツモンドアイ", jockey: "山本奈津実" },
    { number: 4, name: "タムティエーラ", jockey: "田村滉規" },
    { number: 5, name: "ナカイノックス", jockey: "中居洋介" },
    { number: 6, name: "カズレイラ", jockey: "松尾和子" },
    { number: 7, name: "リバティカイランド", jockey: "山下凱生" },
    { number: 8, name: "ウエデュース", jockey: "上田一貴" }
];

// 投票データを保存する配列
let votes = [];

// DOM要素
const showRaceCardBtn = document.getElementById('showRaceCard');
const showVotingBtn = document.getElementById('showVoting');
const showResultsBtn = document.getElementById('showResults');

const raceCardSection = document.getElementById('raceCardSection');
const votingSection = document.getElementById('votingSection');
const resultsSection = document.getElementById('resultsSection');

const horseList = document.getElementById('horseList');
const firstSelect = document.getElementById('first');
const secondSelect = document.getElementById('second');
const thirdSelect = document.getElementById('third');
const submitVoteBtn = document.getElementById('submitVote');
const voteMessage = document.getElementById('voteMessage');
const totalVotes = document.getElementById('totalVotes');
const voteResults = document.getElementById('voteResults');

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // ナビゲーションボタンのイベントリスナー
    showRaceCardBtn.addEventListener('click', () => showSection('raceCard'));
    showVotingBtn.addEventListener('click', () => showSection('voting'));
    showResultsBtn.addEventListener('click', () => showSection('results'));

    // 馬リストの表示
    displayHorses();
    
    // セレクトボックスに馬のオプションを追加
    populateSelects();
    
    // 投票ボタンのイベントリスナー
    submitVoteBtn.addEventListener('click', submitVote);
    
    // セレクトボックスの変更イベントリスナー
    firstSelect.addEventListener('change', validateSelections);
    secondSelect.addEventListener('change', validateSelections);
    thirdSelect.addEventListener('change', validateSelections);
    
    // 結果の表示を更新
    displayResults();
    
    // ローカルストレージから投票データを読み込み
    loadVotesFromStorage();
}

function showSection(section) {
    // 全てのセクションを非表示
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // 指定されたセクションを表示
    switch(section) {
        case 'raceCard':
            raceCardSection.classList.add('active');
            showRaceCardBtn.classList.add('active');
            break;
        case 'voting':
            votingSection.classList.add('active');
            showVotingBtn.classList.add('active');
            break;
        case 'results':
            resultsSection.classList.add('active');
            showResultsBtn.classList.add('active');
            displayResults();
            break;
    }
}

function displayHorses() {
    horseList.innerHTML = '';
    
    horses.forEach(horse => {
        const horseItem = document.createElement('div');
        horseItem.className = 'horse-item';
        
        horseItem.innerHTML = `
            <div class="horse-number">${horse.number}</div>
            <div class="horse-info">
                <div class="horse-name">${horse.name}</div>
                <div class="horse-jockey">騎手: ${horse.jockey}</div>
            </div>
        `;
        
        horseList.appendChild(horseItem);
    });
}

function populateSelects() {
    const selects = [firstSelect, secondSelect, thirdSelect];
    
    selects.forEach(select => {
        // 既存のオプションをクリア（最初のオプションは残す）
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // 馬のオプションを追加
        horses.forEach(horse => {
            const option = document.createElement('option');
            option.value = horse.number;
            option.textContent = `${horse.number}番 ${horse.name}`;
            select.appendChild(option);
        });
    });
}

function validateSelections() {
    const first = firstSelect.value;
    const second = secondSelect.value;
    const third = thirdSelect.value;
    
    // セレクトボックスのオプションを更新
    updateSelectOptions();
    
    // 投票ボタンの有効/無効を切り替え
    const allSelected = first && second && third;
    const allUnique = first !== second && second !== third && first !== third;
    
    submitVoteBtn.disabled = !(allSelected && allUnique);
    
    // エラーメッセージの表示
    if (allSelected && !allUnique) {
        showMessage('同じ馬を複数の着順で選択することはできません。', 'error');
    } else {
        hideMessage();
    }
}

function updateSelectOptions() {
    const selectedValues = [firstSelect.value, secondSelect.value, thirdSelect.value];
    const selects = [firstSelect, secondSelect, thirdSelect];
    
    selects.forEach((select, index) => {
        const options = select.querySelectorAll('option');
        options.forEach(option => {
            if (option.value === '') return; // 最初のオプションはスキップ
            
            const isSelected = selectedValues.includes(option.value) && option.value !== select.value;
            option.disabled = isSelected;
        });
    });
}

function submitVote() {
    const first = parseInt(firstSelect.value);
    const second = parseInt(secondSelect.value);
    const third = parseInt(thirdSelect.value);
    
    if (!first || !second || !third) {
        showMessage('すべての着順を選択してください。', 'error');
        return;
    }
    
    if (first === second || second === third || first === third) {
        showMessage('同じ馬を複数の着順で選択することはできません。', 'error');
        return;
    }
    
    // 投票データを保存
    const vote = { first, second, third, timestamp: new Date() };
    votes.push(vote);
    
    // ローカルストレージに保存
    saveVotesToStorage();
    
    // 成功メッセージを表示
    const firstHorse = horses.find(h => h.number === first);
    const secondHorse = horses.find(h => h.number === second);
    const thirdHorse = horses.find(h => h.number === third);
    
    showMessage(
        `投票完了！ 予想: ${first} → ${second} → ${third}`,
        'success'
    );
    
    // フォームをリセット
    resetForm();
    
    // 結果を更新
    displayResults();
}

function resetForm() {
    firstSelect.value = '';
    secondSelect.value = '';
    thirdSelect.value = '';
    submitVoteBtn.disabled = true;
    updateSelectOptions();
}

function showMessage(text, type) {
    voteMessage.textContent = text;
    voteMessage.className = `message ${type}`;
    voteMessage.style.display = 'block';
}

function hideMessage() {
    voteMessage.style.display = 'none';
}

function displayResults() {
    totalVotes.textContent = votes.length;
    
    if (votes.length === 0) {
        voteResults.innerHTML = '<div class="no-votes">まだ投票がありません</div>';
        return;
    }
    
    // 投票を集計
    const voteCounts = {};
    votes.forEach(vote => {
        const key = `${vote.first}-${vote.second}-${vote.third}`;
        voteCounts[key] = (voteCounts[key] || 0) + 1;
    });
    
    // 投票数でソート
    const sortedVotes = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
    
    // 結果を表示
    voteResults.innerHTML = '';
    sortedVotes.forEach(([combination, count]) => {
        const [first, second, third] = combination.split('-').map(Number);
        const firstHorse = horses.find(h => h.number === first);
        const secondHorse = horses.find(h => h.number === second);
        const thirdHorse = horses.find(h => h.number === third);
        
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        resultItem.innerHTML = `
            <div class="result-combination">
                ${first} → ${second} → ${third}
            </div>
            <div class="result-votes">${count}票</div>
        `;
        
        voteResults.appendChild(resultItem);
    });
}

function saveVotesToStorage() {
    localStorage.setItem('horseGameVotes', JSON.stringify(votes));
}

function loadVotesFromStorage() {
    const savedVotes = localStorage.getItem('horseGameVotes');
    if (savedVotes) {
        votes = JSON.parse(savedVotes);
        displayResults();
    }
}