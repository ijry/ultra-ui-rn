import React, { useEffect, useState } from 'react';
import { Keyboard, Text, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { useUPTheme } from '../../theme';
import { getPx, type UPDimension } from '../../utils';
export type UPTextareaProps = { value?: string | number; modelValue?: string | number; defaultValue?: string | number; placeholder?: string | number; placeholderClass?: string; placeholderStyle?: StyleProp<TextStyle>; height?: UPDimension; confirmType?: string; disabled?: boolean; count?: boolean; focus?: boolean; autoHeight?: boolean; fixed?: boolean; cursorSpacing?: number; cursor?: string | number; showConfirmBar?: boolean; selectionStart?: number; selectionEnd?: number; adjustPosition?: boolean; disableDefaultPadding?: boolean; holdKeyboard?: boolean; maxlength?: number | string; border?: 'surround' | 'bottom'; formatter?: (value: string) => string; customStyle?: StyleProp<ViewStyle>; customClass?: string; onChange?: (value: string) => void; onFocus?: () => void; onBlur?: (value: string) => void; onConfirm?: (value: string) => void;
  /** Source `input` event: fires on every value change (same timing as `onChange`). */
  onInput?: (value: string) => void;
  /** Source `linechange` event: line count change. */
  onLinechange?: (payload: { height: number; lineCount: number }) => void;
  /** Source `keyboardheightchange` event: keyboard show/hide with height. */
  onKeyboardheightchange?: (payload: { height: number; duration?: number }) => void;
};
export function UPTextarea(input: UPTextareaProps): React.JSX.Element {
 const config=useUPConfig(); const props={...config.props.textarea,...input}; const {colors}=useUPTheme(); const controlled=input.value??input.modelValue; const [inner,setInner]=useState(String(controlled??input.defaultValue??props.value)); useEffect(()=>{if(controlled!==undefined)setInner(String(controlled));},[controlled]); const change=(raw:string)=>{const value=input.formatter?.(raw)??raw;setInner(value);input.onChange?.(value);input.onInput?.(value);const lineCount=raw.split('\n').length;input.onLinechange?.({height:getPx(props.height),lineCount})};
 useEffect(()=>{
   const show=Keyboard.addListener('keyboardDidShow',(event)=>input.onKeyboardheightchange?.({height:event.endCoordinates.height}));
   const hide=Keyboard.addListener('keyboardDidHide',()=>input.onKeyboardheightchange?.({height:0}));
   return ()=>{show.remove();hide.remove();};
 },[input.onKeyboardheightchange]); const border:ViewStyle=props.border==='bottom'?{borderBottomColor:colors.borderColor,borderBottomWidth:1}:{borderColor:colors.borderColor,borderRadius:4,borderWidth:1};
 return <View style={[{backgroundColor:props.disabled?colors.bgColor:'#ffffff',height:props.autoHeight?undefined:getPx(props.height),padding:9},border,input.customStyle]} testID="up-textarea"><TextInput autoFocus={props.focus} editable={!props.disabled} maxLength={Number(props.maxlength)<0?undefined:Number(props.maxlength)} multiline onBlur={()=>input.onBlur?.(inner)} onChangeText={change} onFocus={input.onFocus} onSubmitEditing={()=>input.onConfirm?.(inner)} placeholder={String(props.placeholder??'')} placeholderTextColor={colors.tipsColor} returnKeyType={props.confirmType as React.ComponentProps<typeof TextInput>['returnKeyType']} style={{color:colors.contentColor,flex:1,minHeight:getPx(props.height),padding:0,textAlignVertical:'top'}} testID="up-textarea-native" value={inner}/>{props.count?<Text style={{alignSelf:'flex-end',color:colors.tipsColor,fontSize:12}}>{`${inner.length}/${props.maxlength}`}</Text>:null}</View>
}
