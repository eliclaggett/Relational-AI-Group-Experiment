from matplotlib.lines import Line2D
import matplotlib.pyplot as plt
import matplotlib as mpl
import seaborn as sns
import pandas as pd
import numpy as np
import json
import os

# --------------------------------------------------------------------------
# Pretty printing ----------------------------------------------------------
# --------------------------------------------------------------------------

def bf(text):
  return "\033[1m" + text + "\033[0m"

def prettyPrintMulti(view, skipEmpty=True):
    print(f'---------------------------------')
    print(bf(f'{view.name}'))
    print(f'---------------------------------')
    for participantEmpID, vals in view.items():
        if type(vals) != list or len(vals) <= 1 and vals[0]['val'] == '[]':
            continue
        print(participantEmpID)
        for item in vals:
            if (item['val'] != '[]'):
                print('\t'+item['val'])

def prettyPrintList(vals, skipEmpty=True):
    print('[')
    for val in vals:
        if val != '':
            print('\t'+val)
    print(']')

def prettyPrintChats(msgs, stagetimeStamps=None, skipEmpty=True):
    print('[')
    for msg in msgs:
        if stagetimeStamps is not None:
            stageName = ''
            for entry_id in range(len(stagetimeStamps)-1):
                if stagetimeStamps[entry_id]['startTime']<= msg['dt'] and stagetimeStamps[entry_id+1]['startTime']>= msg['dt']: 
                    stageName = stagetimeStamps[entry_id]['name']
                    if 'ready' in stageName or 'transition' in stageName:
                        stageName = stagetimeStamps[entry_id+1]['name']
                    break
            print(f"{stageName}, {msg['dt']}: \"{msg['sender']}\",\"{msg['content']}\"")
        else:
            print(f"{msg['dt']}: \"{msg['sender']}\",\"{msg['content']}\"")
    print(']')

def getMsgCount(msgs, stagetimeStamps, skipEmpty=True):
    total_message_per_stage = {}
    for each_stage in stagetimeStamps: total_message_per_stage[each_stage['name']] = 0
    for msg in msgs:
        for entry_id in range(len(stagetimeStamps)-1):
            if stagetimeStamps[entry_id]['startTime']<= msg['dt'] and stagetimeStamps[entry_id+1]['startTime']>= msg['dt']: 
                stageName = stagetimeStamps[entry_id]['name']
                if 'ready' in stageName or 'transition' in stageName:
                    stageName = stagetimeStamps[entry_id+1]['name']
                    
                total_message_per_stage[stageName] += 1 
                break
        
    return total_message_per_stage

# --------------------------------------------------------------------------
# Data processing ----------------------------------------------------------
# --------------------------------------------------------------------------
def readDataFiles(selected_trials, data_path):
    player_dict_multi = {}
    game_dict_multi = {}
    stage_dict_multi = {}
    playerStage_dict_multi = {}

    for trial in selected_trials:
        print(f'Processing: {trial}')
        scopes = {'stage':{}, 'playerStage':{}, 'player':{}, 'global':{}, 'playerGame':{}, 'playerRound':{}, 'batch':{}, 'round':{}, 'game':{}, 'currentRound': {}}
        id2kind = {}

        with open(f'{data_path}/{trial}') as f:
            for line in f:
                
                jline = json.loads(line)
                if 'kind' in jline:
                    if jline['kind'] == 'Scope':
                        id = jline['obj']['id']
                        kind = jline['obj']['kind']
                        dt = jline['obj']['createdAt']
                        # scopes[kind][id] = {'dt': dt, 'val': v}
                        scopes[kind][id] = {}
                        id2kind[id] = kind
                    if jline['kind'] == 'Attribute' and jline['obj']['key'][0:4] != 'ran-':
                        
                        k = jline['obj']['key']
                        v = jline['obj']['val']
                        dt = jline['obj']['createdAt']
                        id = jline['obj']['nodeID']

                        data = scopes[id2kind[id]]
                        if k in data[id]:
                            data[id][k].append({'dt': dt, 'val': v})
                        else:
                            data[id][k] = [{'dt': dt, 'val': v}]
        
        players = pd.DataFrame(scopes['player'])
        p_t = players.transpose()
        
        game = pd.DataFrame(scopes['game'])
        g_t = game.transpose()

        stage = pd.DataFrame(scopes['stage'])
        s_t = stage.transpose()

        playerStage = pd.DataFrame(scopes['playerStage'])
        ps_t = playerStage.transpose()

        if len(g_t) > 0:
            game_id = g_t.index[0]
            print('trial', trial, 'game_id', game_id)
            g_t["trial_name"] = trial
            player_dict_multi[game_id] = p_t
            game_dict_multi[game_id] = g_t
            stage_dict_multi[game_id] = s_t
            playerStage_dict_multi[game_id] = ps_t
            
    return game_dict_multi, player_dict_multi, stage_dict_multi, playerStage_dict_multi

def empiricaColumnExists(data_store, column_name):
    return column_name in data_store and type(data_store[column_name]) == list

def getMultiGameData(retrieval_func, game_dict_multi, player_dict_multi):
    data = {}
    for gameID in game_dict_multi:
        gameParams = json.loads(game_dict_multi[gameID]['gameParams'].loc[game_dict_multi[gameID]['gameParams'].notna()].iloc[0][0]['val'])
        data[gameID] = {}
        for participantID in player_dict_multi[gameID].index:
            p = player_dict_multi[gameID].loc[participantID]
            data[gameID][participantID] = []
            ret = retrieval_func(p)
            if ret is not None:
                data[gameID][participantID].append(ret)
    return data