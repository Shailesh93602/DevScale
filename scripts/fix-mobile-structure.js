const fs = require('fs');
const path = require('path');

const baseDir = path.join(process.cwd(), 'Backend', 'resources', 'roadmapContent', '5-mobile');

function moveFilesToTopic(subjectPath, topicName) {
    if (!fs.existsSync(subjectPath)) return;
    
    // Check if files exist at the subject level
    const requiredFiles = ['article.html', 'quiz.json'];
    let hasFiles = false;
    for (const file of requiredFiles) {
        if (fs.existsSync(path.join(subjectPath, file))) {
            hasFiles = true;
            break;
        }
    }
    
    if (!hasFiles) return;
    
    // Meta.json might contain info, let's keep the subject meta and create a topic meta
    const subjectMetaPath = path.join(subjectPath, 'meta.json');
    let subjectTitle = topicName.replace(/^\d+-/, '').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    
    if (fs.existsSync(subjectMetaPath)) {
        try {
            const subjectMeta = JSON.parse(fs.readFileSync(subjectMetaPath, 'utf8'));
            if (subjectMeta.title) {
                subjectTitle = subjectMeta.title;
            }
        } catch (e) {}
    }
    
    const topicPath = path.join(subjectPath, topicName);
    if (!fs.existsSync(topicPath)) {
        fs.mkdirSync(topicPath, { recursive: true });
        console.log(`Created topic directory: ${topicPath}`);
    }
    
    // Move files
    const filesToMove = ['article.html', 'quiz.json'];
    for (const file of filesToMove) {
        const sourcePath = path.join(subjectPath, file);
        if (fs.existsSync(sourcePath)) {
            const destPath = path.join(topicPath, file);
            fs.renameSync(sourcePath, destPath);
            console.log(`Moved ${file} to ${topicPath}`);
        }
    }
    
    // Create topic meta.json
    const topicMetaPath = path.join(topicPath, 'meta.json');
    if (!fs.existsSync(topicMetaPath)) {
        const topicMeta = {
            id: topicName,
            title: subjectTitle,
            description: `Comprehensive guide to ${subjectTitle}`,
            order: parseInt(topicName.split('-')[0]) || 1
        };
        fs.writeFileSync(topicMetaPath, JSON.stringify(topicMeta, null, 2));
        console.log(`Created meta.json in ${topicPath}`);
    }
    
    // Update subject meta.json to point to the new topic
    if (fs.existsSync(subjectMetaPath)) {
        try {
            const subjectMeta = JSON.parse(fs.readFileSync(subjectMetaPath, 'utf8'));
            if (!subjectMeta.topics) {
                subjectMeta.topics = [];
            }
            if (!subjectMeta.topics.includes(topicName)) {
                subjectMeta.topics.push(topicName);
                fs.writeFileSync(subjectMetaPath, JSON.stringify(subjectMeta, null, 2));
                console.log(`Updated subject meta.json to include topic: ${topicName}`);
            }
        } catch (e) {
            console.error(`Failed to update ${subjectMetaPath}:`, e.message);
        }
    }
}

// 1. reactNativeFoundations
moveFilesToTopic(path.join(baseDir, '1-reactNativeFoundations', '1-coreComponents'), '1-coreComponents');
moveFilesToTopic(path.join(baseDir, '1-reactNativeFoundations', '2-expo'), '1-expoSetup');
moveFilesToTopic(path.join(baseDir, '1-reactNativeFoundations', '3-stylingAnimations'), '1-stylingAnimations');

// 2. navigationState
moveFilesToTopic(path.join(baseDir, '2-navigationState', '1-reactNavigation'), '1-navigation');
moveFilesToTopic(path.join(baseDir, '2-navigationState', '2-mobileState'), '1-zustandStorage');
moveFilesToTopic(path.join(baseDir, '2-navigationState', '3-offlineStorage'), '1-offlineStorage');

// 3. nativeApiPublishing
moveFilesToTopic(path.join(baseDir, '3-nativeApiPublishing', '1-deviceApis'), '1-deviceAPIs');
moveFilesToTopic(path.join(baseDir, '3-nativeApiPublishing', '2-appStorePublish'), '1-publishing');
moveFilesToTopic(path.join(baseDir, '3-nativeApiPublishing', '3-pushNotifications'), '1-pushNotifications');

console.log('Mobile structure fix complete.');
