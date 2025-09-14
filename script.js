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

// Supabaseクライアント
let isSupabaseConnected = false;

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
    // Supabaseを初期化
    initializeSupabaseConnection();
    
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
    
    // データを読み込み（Supabaseまたはローカルストレージから）
    loadVotesData();
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
            // 最新データを取得してから表示
            loadVotesData();
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

async function submitVote() {
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
    
    // 投票ボタンを無効にして重複投票を防ぐ
    submitVoteBtn.disabled = true;
    showMessage('投票を送信中...', 'info');
    
    // 投票データを作成
    const vote = { first, second, third, timestamp: new Date() };
    
    let saveSuccess = false;
    
    // Supabaseに保存を試みる
    if (isSupabaseConnected) {
        saveSuccess = await saveVoteToSupabase(vote);
    }
    
    // Supabaseに保存できなかった場合はローカルストレージに保存
    if (!saveSuccess) {
        votes.push(vote);
        saveVotesToStorage();
        console.log('⚠️ ローカルストレージに保存しました');
    } else {
        // Supabaseに保存成功した場合は最新データを取得
        await loadVotesFromSupabase();
    }
    
    // 成功メッセージを表示
    const firstHorse = horses.find(h => h.number === first);
    const secondHorse = horses.find(h => h.number === second);
    const thirdHorse = horses.find(h => h.number === third);
    
    const storageType = saveSuccess ? 'Supabase' : 'ローカル';
    showMessage(
        `投票完了！ 予想: ${first}番${firstHorse.name} → ${second}番${secondHorse.name} → ${third}番${thirdHorse.name}`,
        'success'
    );
    
    // フォームをリセット
    resetForm();
    
    // 結果を更新
    displayResults();
    
    // 投票ボタンを再度有効にする
    setTimeout(() => {
        submitVoteBtn.disabled = false;
    }, 2000);
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

// Supabase接続の初期化
function initializeSupabaseConnection() {
    if (typeof initializeSupabase === 'function') {
        isSupabaseConnected = initializeSupabase();
        if (isSupabaseConnected) {
            console.log('✅ Supabaseに接続しました');
        } else {
            console.log('⚠️ Supabaseに接続できませんでした。ローカルストレージを使用します。');
        }
    } else {
        console.log('⚠️ Supabase設定が見つかりません。ローカルストレージを使用します。');
        isSupabaseConnected = false;
    }
}

// データの読み込み（Supabaseまたはローカルストレージから）
async function loadVotesData() {
    if (isSupabaseConnected) {
        await loadVotesFromSupabase();
    } else {
        // loadVotesFromStorage(); // ローカルストレージからの取得をコメントアウト
    }
    displayResults();
}

// Supabaseから投票データを取得
async function loadVotesFromSupabase() {
    try {
        const { data, error } = await supabase
            .from(SUPABASE_CONFIG.tableName)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Supabaseのデータを内部形式に変換
        votes = data.map(vote => ({
            first: vote.first_place,
            second: vote.second_place,
            third: vote.third_place,
            timestamp: new Date(vote.created_at)
        }));

        console.log(`✅ Supabaseから${votes.length}件の投票データを取得しました`);
    } catch (error) {
        console.error('❌ Supabaseからのデータ取得エラー:', error);
        // エラーの場合はローカルストレージから読み込み
        // loadVotesFromStorage(); // ローカルストレージからの取得をコメントアウト
    }
}

// Supabaseに投票データを保存
async function saveVoteToSupabase(vote) {
    try {
        const { data, error } = await supabase
            .from(SUPABASE_CONFIG.tableName)
            .insert([
                {
                    first_place: vote.first,
                    second_place: vote.second,
                    third_place: vote.third,
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) {
            throw error;
        }

        console.log('✅ Supabaseに投票データを保存しました:', data);
        return true;
    } catch (error) {
        console.error('❌ Supabaseへの保存エラー:', error);
        return false;
    }
}

// ローカルストレージから投票データを読み込み
// function loadVotesFromStorage() {
//     const savedVotes = localStorage.getItem('horseGameVotes');
//     if (savedVotes) {
//         votes = JSON.parse(savedVotes);
//         console.log(`✅ ローカルストレージから${votes.length}件の投票データを取得しました`);
//     }
// }