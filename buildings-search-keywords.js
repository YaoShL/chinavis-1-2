import landmarks from '../assets/buildings.json' assert { type: 'json' };
import events from '../assets/events.json' assert { type: 'json' };
import culture from '../assets/culture.json' assert { type: 'json' };
import disaster from '../assets/disaster.json' assert { type: 'json' };
import insdev from '../assets/insdev.json' assert { type: 'json' };
import wars from '../assets/wars.json' assert { type: 'json' };
import character from '../assets/character.json' assert { type: 'json' };
import * as fs from 'fs';
import * as path from 'path';

function buildings_keywords_match() {
    // 遍历地标
    for (let i = 0; i < landmarks.length; i++) {
        // 遍历历程
        for (let j = 0; j < landmarks[i].process.length; j++) {
            const keywords = [events, culture, disaster, insdev, wars];
            // 遍历关键词数据文件
            for (let s= 0; s < keywords.length; s++) {
                // 遍历关键词
                for (let k = 0; k < keywords[s].length; k++) {
                    // 从文本中查找含建筑名的
                    if (keywords[s][k].text.includes(landmarks[i].name)) {
                        const keywordItem = {name: keywords[s][k].keyword, text: keywords[s][k].text, value: 100}
                        landmarks[i].process[j].keywords.push(keywordItem)
                    }
                    // 如果关键词或者历程没有时间，则跳过
                    if (keywords[s][k].time === '' || landmarks[i].process[j].time === '') {
                        continue
                    }
                    // 否则查询前20年事件的关键词(灾害只查找前5年)
                    else {
                        if (s == 2) {
                            if (Number(landmarks[i].process[j].time) - 5 < Number(keywords[s][k].time) && Number(keywords[s][k].time) < Number(landmarks[i].process[j].time)) {
                                const keywordItem = {name: keywords[s][k].keyword, text: keywords[s][k].text, value: 20}
                                landmarks[i].process[j].keywords.push(keywordItem)
                            }
                        }
                        else{
                            if (Number(landmarks[i].process[j].time) - 20 < Number(keywords[s][k].time) && Number(keywords[s][k].time) < Number(landmarks[i].process[j].time)) {
                                const keywordItem = {name: keywords[s][k].keyword, text: keywords[s][k].text, value: 100}
                                landmarks[i].process[j].keywords.push(keywordItem)
                            }
                        }
                    }
                }
            }
            // 遍历人物文件，搜索跟建筑有关的人物
            for (let k = 0; k < character.length; k++) {
                if (character[k].name.includes(landmarks[i].name)) {
                    const keywordItem = {name: character[k].character, text: character[k].text, value: 100}
                        landmarks[i].process[j].keywords.push(keywordItem)
                }
            }
        }
  }
  return Array.from(landmarks.values());
}

function write() {
    const data = buildings_keywords_match();
    fs.writeFileSync(
        path.join(process.cwd(), 'src/assets', 'data.json'),
        JSON.stringify(data, null, 2)
    );
}

const result = write();
console.log('data数据转化成功')